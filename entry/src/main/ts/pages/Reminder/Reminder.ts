import router from '@system.router';
import prompt from '@system.prompt';
import reminderService from '../services/ReminderService';

@Entry
@Component
struct Reminder {
  @State reminders: ReminderItem[] = [];
  @State showAddDialog: boolean = false;
  @State newTitle: string = '';
  @State newContent: string = '';
  @State newHour: number = 8;
  @State newMinute: number = 0;
  @State selectedRepeat: string = 'once';

  aboutToAppear() {
    this.loadReminders();
  }

  async loadReminders() {
    this.reminders = await reminderService.getReminders();
  }

  async addReminder() {
    if (!this.newTitle) {
      prompt.showToast({ message: '请输入提醒标题' });
      return;
    }

    const reminder: ReminderData = {
      title: this.newTitle,
      content: this.newContent,
      hour: this.newHour,
      minute: this.newMinute,
      repeatType: this.selectedRepeat,
      enabled: true
    };

    await reminderService.addReminder(reminder);
    prompt.showToast({ message: '提醒已添加' });
    this.showAddDialog = false;
    this.clearForm();
    this.loadReminders();
  }

  async toggleReminder(id: number, enabled: boolean) {
    await reminderService.toggleReminder(id, !enabled);
    this.loadReminders();
  }

  async deleteReminder(id: number) {
    await reminderService.deleteReminder(id);
    prompt.showToast({ message: '提醒已删除' });
    this.loadReminders();
  }

  clearForm() {
    this.newTitle = '';
    this.newContent = '';
    this.newHour = 8;
    this.newMinute = 0;
    this.selectedRepeat = 'once';
  }

  build() {
    Stack() {
      Column() {
        Row() {
          Image($r('app.media.icon_back'))
            .width(24)
            .height(24)
            .margin({ left: 10 })
            .onClick(() => router.back())
          Blank()
          Text('智能提醒')
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

        if (this.reminders.length === 0) {
          Column() {
            Image($r('app.media.icon_empty'))
              .width(80)
              .height(80)
            Text('暂无提醒')
              .fontSize(16)
              .fontColor('#999999')
              .margin({ top: 15 })
          }
          .width('100%')
          .flexGrow(1)
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        } else {
          Scroll() {
            Column() {
              ForEach(this.reminders, (item: ReminderItem) => {
                Column() {
                  Row() {
                    Column() {
                      Text(item.title)
                        .fontSize(18)
                        .fontWeight(FontWeight.Medium)
                      Text(item.content)
                        .fontSize(14)
                        .fontColor('#666666')
                        .margin({ top: 5 })
                    }
                    .alignItems(HorizontalAlign.Start)
                    .layoutWeight(1)

                    Toggle({ isOn: item.enabled })
                      .onChange((isOn: boolean) => this.toggleReminder(item.id, item.enabled))
                  }
                  .width('100%')
                  .justifyContent(FlexAlign.SpaceBetween)

                  Row() {
                    Text(this.formatTime(item.hour, item.minute))
                      .fontSize(14)
                      .fontColor('#1890FF')
                    Text(item.repeatType === 'once' ? '仅一次' : item.repeatType === 'daily' ? '每天' : '每周')
                      .fontSize(12)
                      .fontColor('#999999')
                      .margin({ left: 15 })
                    Blank()
                    Image($r('app.media.icon_delete'))
                      .width(24)
                      .height(24)
                      .onClick(() => this.deleteReminder(item.id))
                  }
                  .width('100%')
                  .margin({ top: 10 })
                }
                .width('100%')
                .padding(20)
                .backgroundColor('#FFFFFF')
                .borderRadius(12)
                .margin({ top: 15, left: 20, right: 20 })
              })
            }
            .width('100%')
            .padding({ bottom: 30 })
          }
          .width('100%')
          .flexGrow(1)
          .scrollable(ScrollScroller.Regular)
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#F5F5F5')

      if (this.showAddDialog) {
        Column() {
          Text('添加提醒')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .margin({ bottom: 20 })

          TextInput({ placeholder: '提醒标题' })
            .width('90%')
            .height(56)
            .backgroundColor('#F5F5F5')
            .margin({ bottom: 15 })
            .onChange((value) => this.newTitle = value)

          TextInput({ placeholder: '提醒内容（可选）' })
            .width('90%')
            .height(56)
            .backgroundColor('#F5F5F5')
            .margin({ bottom: 15 })
            .onChange((value) => this.newContent = value)

          Row() {
            Text('时间：')
              .fontSize(16)
            Picker({ range: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'], selected: this.newHour - 6 })
              .width(60)
              .height(40)
              .onChange((value: number) => this.newHour = value + 6)
            Text(':')
              .fontSize(20)
            Picker({ range: this.getMinuteRange(), selected: this.newMinute })
              .width(60)
              .height(40)
              .onChange((value: number) => this.newMinute = value)
          }
          .width('90%')
          .justifyContent(FlexAlign.Center)
          .margin({ bottom: 15 })

          Row() {
            Text('重复：')
              .fontSize(16)
            Radio({ value: 'once', group: 'repeat' })
              .checked(true)
              .onChange((checked: boolean) => { if (checked) this.selectedRepeat = 'once' })
            Text('仅一次')
              .fontSize(14)
              .margin({ right: 20 })
            Radio({ value: 'daily', group: 'repeat' })
              .onChange((checked: boolean) => { if (checked) this.selectedRepeat = 'daily' })
            Text('每天')
              .fontSize(14)
            Radio({ value: 'weekly', group: 'repeat' })
              .onChange((checked: boolean) => { if (checked) this.selectedRepeat = 'weekly' })
            Text('每周')
              .fontSize(14)
          }
          .width('90%')
          .justifyContent(FlexAlign.Center)
          .margin({ bottom: 20 })

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
              .onClick(() => this.addReminder())
          }
          .width('90%')
          .justifyContent(FlexAlign.SpaceBetween)
        }
        .width('100%')
        .height('70%')
        .backgroundColor('#FFFFFF')
        .position({ bottom: 0 })
        .alignItems(HorizontalAlign.Center)
        .justifyContent(FlexAlign.Center)
        .padding({ top: 30 })
      }
    }
    .width('100%')
    .height('100%')
  }

  formatTime(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  getMinuteRange(): string[] {
    const minutes: string[] = [];
    for (let i = 0; i < 60; i += 5) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
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