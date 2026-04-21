import relationalStore from '@ohos.data.relationalStore';

class FamilyCareService {
  private db: relationalStore.RdbStore | null = null;
  private memberTable: string = 'family_members';
  private messageTable: string = 'family_messages';

  async init(context): Promise<void> {
    const config = {
      name: 'family_care.db',
      securityLevel: relationalStore.SecurityLevel.S1
    };
    this.db = await relationalStore.getRdbStore(context, config);
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    const memberSql = `
      CREATE TABLE IF NOT EXISTS ${this.memberTable} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        relation TEXT,
        created_at INTEGER NOT NULL
      )
    `;

    const messageSql = `
      CREATE TABLE IF NOT EXISTS ${this.messageTable} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        direction TEXT DEFAULT 'outgoing',
        created_at INTEGER NOT NULL
      )
    `;

    await this.db.executeSql(memberSql);
    await this.db.executeSql(messageSql);
  }

  async getFamilyMembers(): Promise<FamilyMember[]> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.memberTable);
    predicates.orderByDesc('created_at');

    const resultSet = await this.db.query(predicates);
    const members: FamilyMember[] = [];

    while (resultSet.goToNextRow()) {
      members.push({
        id: resultSet.getString(resultSet.getColumnIndex('id')),
        name: resultSet.getString(resultSet.getColumnIndex('name')),
        phone: resultSet.getString(resultSet.getColumnIndex('phone')),
        relation: resultSet.getString(resultSet.getColumnIndex('relation')) || ''
      });
    }

    resultSet.close();
    return members;
  }

  async addFamilyMember(data: FamilyMemberData): Promise<boolean> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const id = 'member_' + Date.now();
    const valueSet = {
      id: id,
      user_id: 'user_001',
      name: data.name,
      phone: data.phone,
      relation: data.relation,
      created_at: Date.now()
    };

    try {
      await this.db.insert(this.memberTable, valueSet);
      return true;
    } catch (e) {
      console.error('Add family member failed:', e);
      return false;
    }
  }

  async deleteFamilyMember(id: string): Promise<boolean> {
    if (!this.db) return false;

    const predicates = new relationalStore.RdbPredicates(this.memberTable);
    predicates.equalTo('id', id);

    try {
      await this.db.delete(predicates);
      return true;
    } catch (e) {
      console.error('Delete family member failed:', e);
      return false;
    }
  }

  async getMessages(): Promise<FamilyMessage[]> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const predicates = new relationalStore.RdbPredicates(this.messageTable);
    predicates.orderByDesc('created_at').limitAs(50);

    const resultSet = await this.db.query(predicates);
    const messages: FamilyMessage[] = [];

    while (resultSet.goToNextRow()) {
      messages.push({
        id: resultSet.getLong(resultSet.getColumnIndex('id')),
        memberId: resultSet.getString(resultSet.getColumnIndex('member_id')),
        content: resultSet.getString(resultSet.getColumnIndex('content')),
        type: resultSet.getString(resultSet.getColumnIndex('type')),
        createdAt: resultSet.getLong(resultSet.getColumnIndex('created_at'))
      });
    }

    resultSet.close();
    return messages;
  }

  async sendMessage(data: MessageData): Promise<boolean> {
    if (!this.db) {
      await this.init(this.getContext());
    }

    const valueSet = {
      user_id: 'user_001',
      member_id: data.memberId,
      content: data.content,
      type: data.type,
      direction: 'outgoing',
      created_at: Date.now()
    };

    try {
      await this.db.insert(this.messageTable, valueSet);
      return true;
    } catch (e) {
      console.error('Send message failed:', e);
      return false;
    }
  }

  private getContext() {
    return globalThis.getContext();
  }
}

interface FamilyMemberData {
  name: string;
  phone: string;
  relation: string;
}

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface MessageData {
  memberId: string;
  content: string;
  type: string;
}

interface FamilyMessage {
  id: number;
  memberId: string;
  content: string;
  type: string;
  createdAt: number;
}

export default new FamilyCareService();