import relationalStore from '@ohos.data.relationalStore';
import prompt from '@system.prompt';

class MedicalDataService {
  private db: relationalStore.RdbStore | null = null;
  private tableName: string = 'health_data';

  async init(context): Promise<void> {
    const config = {
      name: 'medical_data.db',
      securityLevel: relationalStore.SecurityLevel.S1
    };
    this.db = await relationalStore.getRdbStore(context, config);
    await this.createTable();
  }

  private async createTable(): Promise<void> {
    if (!this.db) return;

    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        data_type TEXT NOT NULL,
        value REAL NOT NULL,
        diastolic REAL,
        heart_rate REAL,
        temperature REAL,
        unit TEXT,
        recorded_at INTEGER NOT NULL,
        device_id TEXT
      )
    `;
    await this.db.executeSql(sql);
  }

  async saveHealthData(data: HealthData): Promise<boolean> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const valueSet = {
      user_id: 'user_001',
      data_type: data.type,
      value: data.value,
      diastolic: data.diastolic,
      heart_rate: data.heartRate,
      temperature: data.temperature,
      unit: this.getUnit(data.type),
      recorded_at: data.recordedAt,
      device_id: 'device_001'
    };

    try {
      await this.db.insert(this.tableName, valueSet);
      return true;
    } catch (e) {
      console.error('Save health data failed:', e);
      return false;
    }
  }

  async getHealthRecords(limit: number = 20): Promise<HealthRecord[]> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.tableName);
    predicates.orderByDesc('recorded_at').limitAs(limit);

    const resultSet = await this.db.query(predicates);
    const records: HealthRecord[] = [];

    while (resultSet.goToNextRow()) {
      records.push({
        id: resultSet.getLong(resultSet.getColumnIndex('id')),
        type: resultSet.getString(resultSet.getColumnIndex('data_type')),
        value: this.formatValue(resultSet),
        recordedAt: resultSet.getLong(resultSet.getColumnIndex('recorded_at'))
      });
    }

    resultSet.close();
    return records;
  }

  async getLatestData(type: string): Promise<HealthData | null> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.tableName);
    predicates.equalTo('data_type', type).orderByDesc('recorded_at').limitAs(1);

    const resultSet = await this.db.query(predicates);

    if (resultSet.goToFirstRow()) {
      const data: HealthData = {
        type: resultSet.getString(resultSet.getColumnIndex('data_type')),
        value: resultSet.getDouble(resultSet.getColumnIndex('value')),
        diastolic: resultSet.getDouble(resultSet.getColumnIndex('diastolic')),
        heartRate: resultSet.getDouble(resultSet.getColumnIndex('heart_rate')),
        temperature: resultSet.getDouble(resultSet.getColumnIndex('temperature')),
        recordedAt: resultSet.getLong(resultSet.getColumnIndex('recorded_at'))
      };
      resultSet.close();
      return data;
    }

    resultSet.close();
    return null;
  }

  private getUnit(type: string): string {
    const units: { [key: string]: string } = {
      bloodPressure: 'mmHg',
      heartRate: '次/分',
      temperature: '℃'
    };
    return units[type] || '';
  }

  private formatValue(resultSet: relationalStore.ResultSet): string {
    const type = resultSet.getString(resultSet.getColumnIndex('data_type'));
    const value = resultSet.getDouble(resultSet.getColumnIndex('value'));
    const diastolic = resultSet.getDouble(resultSet.getColumnIndex('diastolic'));
    const heartRate = resultSet.getDouble(resultSet.getColumnIndex('heart_rate'));
    const temperature = resultSet.getDouble(resultSet.getColumnIndex('temperature'));

    switch (type) {
      case 'bloodPressure':
        return `${value}/${diastolic} mmHg`;
      case 'heartRate':
        return `${heartRate} 次/分`;
      case 'temperature':
        return `${temperature} ℃`;
      default:
        return `${value}`;
    }
  }

  private getContext() {
    return globalThis.getContext();
  }
}

interface HealthData {
  type: string;
  value: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  recordedAt: number;
}

interface HealthRecord {
  id: number;
  type: string;
  value: string;
  recordedAt: number;
}

export default new MedicalDataService();