import relationalStore from '@ohos.data.relationalStore';
import notificationManager from '@ohos.notificationManager';

class ReminderService {
  private db: relationalStore.RdbStore | null = null;
  private tableName: string = 'reminders';

  async init(context): Promise<void> {
    const config = {
      name: 'reminder_data.db',
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
        title TEXT NOT NULL,
        content TEXT,
        remind_at INTEGER NOT NULL,
        repeat_type TEXT DEFAULT 'once',
        enabled INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    `;
    await this.db.executeSql(sql);
  }

  async addReminder(data: ReminderData): Promise<boolean> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const now = Date.now();
    const remindAt = this.calculateRemindAt(data.hour, data.minute);

    const valueSet = {
      user_id: 'user_001',
      title: data.title,
      content: data.content,
      remind_at: remindAt,
      repeat_type: data.repeatType,
      enabled: data.enabled ? 1 : 0,
      created_at: now
    };

    try {
      await this.db.insert(this.tableName, valueSet);

      if (data.enabled) {
        await this.scheduleNotification(data.title, data.content, remindAt);
      }

      return true;
    } catch (e) {
      console.error('Add reminder failed:', e);
      return false;
    }
  }

  async getReminders(): Promise<ReminderItem[]> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.tableName);
    predicates.orderByDesc('created_at');

    const resultSet = await this.db.query(predicates);
    const reminders: ReminderItem[] = [];

    while (resultSet.goToNextRow()) {
      const remindAt = resultSet.getLong(resultSet.getColumnIndex('remind_at'));
      const date = new Date(remindAt);

      reminders.push({
        id: resultSet.getLong(resultSet.getColumnIndex('id')),
        title: resultSet.getString(resultSet.getColumnIndex('title')),
        content: resultSet.getString(resultSet.getColumnIndex('content')) || '',
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeatType: resultSet.getString(resultSet.getColumnIndex('repeat_type')),
        enabled: resultSet.getLong(resultSet.getColumnIndex('enabled')) === 1
      });
    }

    resultSet.close();
    return reminders;
  }

  async toggleReminder(id: number, enabled: boolean): Promise<boolean> {
    if (!this.db) return false;

    const predicates = new relationalStore.RdbPredicates(this.tableName);
    predicates.equalTo('id', id);

    try {
      await this.db.update(predicates, { enabled: enabled ? 1 : 0 });
      return true;
    } catch (e) {
      console.error('Toggle reminder failed:', e);
      return false;
    }
  }

  async deleteReminder(id: number): Promise<boolean> {
    if (!this.db) return false;

    const predicates = new relationalStore.RdbPredicates(this.tableName);
    predicates.equalTo('id', id);

    try {
      await this.db.delete(predicates);
      return true;
    } catch (e) {
      console.error('Delete reminder failed:', e);
      return false;
    }
  }

  private calculateRemindAt(hour: number, minute: number): number {
    const now = new Date();
    const remindDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    if (remindDate.getTime() <= now.getTime()) {
      remindDate.setDate(remindDate.getDate() + 1);
    }

    return remindDate.getTime();
  }

  private async scheduleNotification(title: string, content: string, triggerTime: number): Promise<void> {
    try {
      const request = {
        id: Math.floor(Math.random() * 10000),
        content: {
          contentType: notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
          normal: {
            title: title,
            text: content
          }
        },
        wantAgent: {
          pkgName: 'com.smartelderly.care',
          abilityName: 'MainAbility'
        },
        deliveryTime: triggerTime
      };

      await notificationManager.publish(request);
    } catch (e) {
      console.error('Schedule notification failed:', e);
    }
  }

  private getContext() {
    return globalThis.getContext();
  }
}

interface ReminderData {
  title: string;
  content: string;
  hour: number;
  minute: number;
  repeatType: string;
  enabled: boolean;
}

interface ReminderItem {
  id: number;
  title: string;
  content: string;
  hour: number;
  minute: number;
  repeatType: string;
  enabled: boolean;
}

export default new ReminderService();