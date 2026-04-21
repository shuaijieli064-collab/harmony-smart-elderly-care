import router from '@system.router';
import prompt from '@system.prompt';
import familyCareService from '../services/FamilyCareService';

@Entry
@Component
struct FamilyCare {
  @State familyMembers: FamilyMember[] = [];
  @State messages: FamilyMessage[] = [];
  @State showAddDialog: boolean = false;
  @State newMemberName: string = '';
  @State newMemberPhone: string = '';
  @State newMemberRelation: string = '';
  @State selectedMemberId: string = '';
  @State messageContent: string = '';

  aboutToAppear() {
    this.loadFamilyMembers();
    this.loadMessages();
  }

  async loadFamilyMembers() {
    this.familyMembers = await familyCareService.getFamilyMembers();
  }

  async loadMessages() {
    this.messages = await familyCareService.getMessages();
  }

  async addMember() {
    if (!this.newMemberName || !this.newMemberPhone) {
      prompt.showToast({ message: '请填写完整信息' });
      return;
    }

    const member: FamilyMemberData = {
      name: this.newMemberName,
      phone: this.newMemberPhone,
      relation: this.newMemberRelation
    };

    await familyCareService.addFamilyMember(member);
    prompt.showToast({ message: '家人添加成功' });
    this.showAddDialog = false;
    this.clearForm();
    this.loadFamilyMembers();
  }

  async sendMessage() {
    if (!this.selectedMemberId || !this.messageContent) {
      prompt.showToast({ message: '请选择家人并输入内容' });
      return;
    }

    const message: MessageData = {
      memberId: this.selectedMemberId,
      content: this.messageContent,
      type: 'text'
    };

    await familyCareService.sendMessage(message);
    prompt.showToast({ message: '消息已发送' });
    this.messageContent = '';
    this.loadMessages();
  }

  async deleteMember(id: string) {
    await familyCareService.deleteFamilyMember(id);
    prompt.showToast({ message: '家人已删除' });
    this.loadFamilyMembers();
  }

  clearForm() {
    this.newMemberName = '';
    this.newMemberPhone = '';
    this.newMemberRelation = '';
  }

  build() {
    Column() {
      Row() {
        Image($r('app.media.icon_back'))
          .width(24)
          .height(24)
          .margin({ left: 10 })
          .onClick(() => router.back())
        Blank()
        Text('亲情关怀')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
        Blank()
        Image($r('app.media.icon_add'))
          .width(28)
          .height(28)
          .margin({ right: 10 })
          .onClick(() => this.showAddDialog = true)
      }
      .width('100%')
      .height(60)
      .padding({ left: 10, right: 10 })

      Scroll() {
        Column() {
          Text('家人列表')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 15, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          if (this.familyMembers.length === 0) {
            Column() {
              Text('暂无家人添加')
                .fontSize(14)
                .fontColor('#999999')
            }
            .width('90%')
            .height(80)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .justifyContent(FlexAlign.Center)
            .margin({ top: 10 })
          } else {
            ForEach(this.familyMembers, (member: FamilyMember) => {
              Row() {
                Column() {
                  Text(member.name)
                    .fontSize(18)
                    .fontWeight(FontWeight.Medium)
                  Text(member.relation + ' | ' + member.phone)
                    .fontSize(14)
                    .fontColor('#666666')
                    .margin({ top: 5 })
                }
                .alignItems(HorizontalAlign.Start)
                .layoutWeight(1)

                Image($r('app.media.icon_delete'))
                  .width(24)
                  .height(24)
                  .onClick(() => this.deleteMember(member.id))
              }
              .width('90%')
              .height(70)
              .backgroundColor('#FFFFFF')
              .borderRadius(12)
              .padding({ left: 15, right: 15 })
              .margin({ top: 10 })
            })
          }

          Text('发送关怀消息')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 25, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          Column() {
            Text('选择家人')
              .fontSize(14)
              .margin({ bottom: 10 })
              .alignSelf(HorizontalAlign.Start)

            if (this.familyMembers.length === 0) {
              Text('请先添加家人')
                .fontSize(14)
                .fontColor('#999999')
            } else {
              Select({ options: this.familyMembers.map(m => ({ value: m.name, id: m.id })) })
                .width('100%')
                .height(48)
                .onChange((value: { id: string, value: string }) => {
                  this.selectedMemberId = value.id;
                })
            }
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 10 })

          Column() {
            Text('消息内容')
              .fontSize(14)
              .margin({ bottom: 10 })
              .alignSelf(HorizontalAlign.Start)

            TextArea({ placeholder: '请输入关怀消息...' })
              .width('100%')
              .height(100)
              .backgroundColor('#F5F5F5')
              .onChange((value) => this.messageContent = value)
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 15 })

          Button('发送关怀')
            .width('90%')
            .height(56)
            .backgroundColor('#1890FF')
            .fontSize(18)
            .margin({ top: 20 })
            .onClick(() => this.sendMessage())

          Text('消息记录')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 25, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          ForEach(this.messages, (msg: FamilyMessage) => {
            Column() {
              Row() {
                Text(this.getMemberName(msg.memberId))
                  .fontSize(14)
                  .fontColor('#1890FF')
                Blank()
                Text(this.formatTime(msg.createdAt))
                  .fontSize(12)
                  .fontColor('#999999')
              }
              .width('100%')
              .justifyContent(FlexAlign.SpaceBetween)

              Text(msg.content)
                .fontSize(16)
                .margin({ top: 8 })
                .alignSelf(HorizontalAlign.Start)
            }
            .width('90%')
            .padding(15)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .margin({ top: 10 })
          })
        }
        .width('100%')
        .padding({ bottom: 30 })
      }
      .width('100%')
      .flexGrow(1)
      .scrollable(ScrollScroller.Regular)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')

    if (this.showAddDialog) {
      Column() {
        Text('添加家人')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ bottom: 20 })

        TextInput({ placeholder: '姓名' })
          .width('90%')
          .height(56)
          .backgroundColor('#F5F5F5')
          .margin({ bottom: 15 })
          .onChange((value) => this.newMemberName = value)

        TextInput({ placeholder: '电话' })
          .type(InputType.Phone)
          .width('90%')
          .height(56)
          .backgroundColor('#F5F5F5')
          .margin({ bottom: 15 })
          .onChange((value) => this.newMemberPhone = value)

        TextInput({ placeholder: '关系（如：女儿、儿子）' })
          .width('90%')
          .height(56)
          .backgroundColor('#F5F5F5')
          .margin({ bottom: 20 })
          .onChange((value) => this.newMemberRelation = value)

        Row() {
          Button('取消')
            .width(120)
            .height(48)
            .backgroundColor('#E0E0E0')
            .fontColor('#333333')
            .onClick(() => this.showAddDialog = false)
          Blank()
          Button('确定')
            .width(120)
            .height(48)
            .backgroundColor('#1890FF')
            .onClick(() => this.addMember())
        }
        .width('90%')
        .justifyContent(FlexAlign.SpaceBetween)
      }
      .width('100%')
      .height('60%')
      .backgroundColor('#FFFFFF')
      .position({ bottom: 0 })
      .alignItems(HorizontalAlign.Center)
      .justifyContent(FlexAlign.Center)
      .padding({ top: 30 })
    }
  }

  getMemberName(id: string): string {
    const member = this.familyMembers.find(m => m.id === id);
    return member ? member.name : '未知';
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
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