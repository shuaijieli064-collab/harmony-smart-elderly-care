import relationalStore from '@ohos.data.relationalStore';
import preferences from '@ohos.app.ability.preferences';

class AlertService {
  private db: relationalStore.RdbStore | null = null;
  private alertTable: string = 'alerts';
  private prefsKey: string = 'threshold_config';

  async init(context): Promise<void> {
    const config = {
      name: 'alert_data.db',
      securityLevel: relationalStore.SecurityLevel.S1
    };
    this.db = await relationalStore.getRdbStore(context, config);
    await this.createTable();
  }

  private async createTable(): Promise<void> {
    if (!this.db) return;

    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.alertTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        value REAL NOT NULL,
        threshold REAL NOT NULL,
        level TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL
      )
    `;
    await this.db.executeSql(sql);
  }

  async checkAndCreateAlert(data: HealthCheckData): Promise<AlertItem | null> {
    const thresholds = await this.getThresholds();
    const type = data.type;
    const value = data.value;

    const threshold = thresholds[type];
    if (!threshold) return null;

    let level = '';
    let shouldAlert = false;

    if (value > threshold.max) {
      level = value > threshold.max * 1.2 ? 'critical' : 'warning';
      shouldAlert = true;
    } else if (value < threshold.min) {
      level = value < threshold.min * 0.8 ? 'critical' : 'warning';
      shouldAlert = true;
    }

    if (shouldAlert) {
      const alert: AlertData = {
        userId: 'user_001',
        dataType: type,
        value: value,
        threshold: value > threshold.max ? threshold.max : threshold.min,
        level: level,
        description: `${type} ${value} 超过正常范围 [${threshold.min}-${threshold.max}]`
      };

      await this.saveAlert(alert);
      return this.convertToAlertItem(alert);
    }

    return null;
  }

  async getAlerts(): Promise<AlertItem[]> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.alertTable);
    predicates.orderByDesc('created_at').limitAs(50);

    const resultSet = await this.db.query(predicates);
    const alerts: AlertItem[] = [];

    while (resultSet.goToNextRow()) {
      alerts.push({
        id: resultSet.getLong(resultSet.getColumnIndex('id')),
        userId: resultSet.getString(resultSet.getColumnIndex('user_id')),
        dataType: resultSet.getString(resultSet.getColumnIndex('data_type')),
        value: resultSet.getDouble(resultSet.getColumnIndex('value')),
        threshold: resultSet.getDouble(resultSet.getColumnIndex('threshold')),
        level: resultSet.getString(resultSet.getColumnIndex('level')),
        description: resultSet.getString(resultSet.getColumnIndex('description')),
        createdAt: resultSet.getLong(resultSet.getColumnIndex('created_at'))
      });
    }

    resultSet.close();
    return alerts;
  }

  async getThresholds(): Promise<ThresholdConfig> {
    const defaultConfig: ThresholdConfig = {
      bloodPressureSys: { min: 90, max: 140 },
      bloodPressureDia: { min: 60, max: 90 },
      heartRate: { min: 60, max: 100 },
      temperature: { min: 36.0, max: 37.3 }
    };

    try {
      const context = this.getContext();
      const prefs = await preferences.getPreferences(context, this.prefsKey);
      const savedConfig = await prefs.get('thresholds', JSON.stringify(defaultConfig));
      return JSON.parse(savedConfig as string);
    } catch (e) {
      return defaultConfig;
    }
  }

  async setThreshold(type: string, value: { min: number; max: number }): Promise<boolean> {
    try {
      const thresholds = await this.getThresholds();
      thresholds[type] = value;

      const context = this.getContext();
      const prefs = await preferences.getPreferences(context, this.prefsKey);
      await prefs.put('thresholds', JSON.stringify(thresholds));
      await prefs.flush();

      return true;
    } catch (e) {
      console.error('Set threshold failed:', e);
      return false;
    }
  }

  private async saveAlert(data: AlertData): Promise<void> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const valueSet = {
      user_id: data.userId,
      data_type: data.dataType,
      value: data.value,
      threshold: data.threshold,
      level: data.level,
      description: data.description,
      created_at: Date.now()
    };

    await this.db.insert(this.alertTable, valueSet);
  }

  private convertToAlertItem(data: AlertData): AlertItem {
    return {
      id: 0,
      userId: data.userId,
      dataType: data.dataType,
      value: data.value,
      threshold: data.threshold,
      level: data.level,
      description: data.description,
      createdAt: Date.now()
    };
  }

  private getContext() {
    return globalThis.getContext();
  }
}

interface HealthCheckData {
  type: string;
  value: number;
}

interface AlertData {
  userId: string;
  dataType: string;
  value: number;
  threshold: number;
  level: string;
  description: string;
}

interface ThresholdConfig {
  bloodPressureSys: { min: number; max: number };
  bloodPressureDia: { min: number; max: number };
  heartRate: { min: number; max: number };
  temperature: { min: number; max: number };
}

interface AlertItem {
  id: number;
  userId: string;
  dataType: string;
  value: number;
  threshold: number;
  level: string;
  description: string;
  createdAt: number;
}

export default new AlertService();