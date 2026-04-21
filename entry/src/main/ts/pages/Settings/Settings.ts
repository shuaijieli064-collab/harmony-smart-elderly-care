import router from '@system.router';
import prompt from '@system.prompt';
import preferences from '@ohos.app.ability.preferences';

@Entry
@Component
struct Settings {
  @State userName: string = '用户';
  @State fontSize: number = 18;
  @State notificationsEnabled: boolean = true;
  @State dataSyncEnabled: boolean = true;

  aboutToAppear() {
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const context = this.getContext();
      const prefs = await preferences.getPreferences(context, 'user_settings');
      this.userName = await prefs.get('userName', '用户') as string;
      this.fontSize = await prefs.get('fontSize', 18) as number;
      this.notificationsEnabled = await prefs.get('notificationsEnabled', true) as boolean;
      this.dataSyncEnabled = await prefs.get('dataSyncEnabled', true) as boolean;
    } catch (e) {
      console.log('Load settings failed:', e);
    }
  }

  async saveSettings() {
    try {
      const context = this.getContext();
      const prefs = await preferences.getPreferences(context, 'user_settings');
      await prefs.put('userName', this.userName);
      await prefs.put('fontSize', this.fontSize);
      await prefs.put('notificationsEnabled', this.notificationsEnabled);
      await prefs.put('dataSyncEnabled', this.dataSyncEnabled);
      await prefs.flush();
      prompt.showToast({ message: '设置已保存' });
    } catch (e) {
      console.log('Save settings failed:', e);
      prompt.showToast({ message: '设置保存失败' });
    }
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
        Text('设置')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
        Blank()
        Blank()
          .width(40)
      }
      .width('100%')
      .height(60)
      .padding({ left: 10, right: 10 })

      Scroll() {
        Column() {
          Text('个人设置')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 15, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          Column() {
            Row() {
              Text('用户名')
                .fontSize(16)
              Blank()
              TextInput({ text: this.userName })
                .width(180)
                .height(48)
                .textAlign(TextAlign.End)
                .onChange((value) => this.userName = value)
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 10 })

          Column() {
            Row() {
              Text('字体大小')
                .fontSize(16)
              Blank()
              Text(`${this.fontSize}sp`)
                .fontSize(16)
                .fontColor('#1890FF')
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)

            Slider({
              value: this.fontSize,
              min: 14,
              max: 24,
              step: 2
            })
              .width('100%')
              .margin({ top: 10 })
              .onChange((value: number) => {
                this.fontSize = value;
              })
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 15 })

          Text('通知设置')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 25, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          Column() {
            Row() {
              Text('接收提醒通知')
                .fontSize(16)
              Blank()
              Toggle({ isOn: this.notificationsEnabled })
                .onChange((isOn: boolean) => {
                  this.notificationsEnabled = isOn;
                })
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)

            Row() {
              Text('数据同步')
                .fontSize(16)
              Blank()
              Toggle({ isOn: this.dataSyncEnabled })
                .onChange((isOn: boolean) => {
                  this.dataSyncEnabled = isOn;
                })
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
            .margin({ top: 15 })
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 10 })

          Text('关于')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 25, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          Column() {
            Row() {
              Text('版本')
                .fontSize(16)
              Blank()
              Text('1.0.0')
                .fontSize(16)
                .fontColor('#666666')
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)

            Row() {
              Text('开发者')
                .fontSize(16)
              Blank()
              Text('智慧医养团队')
                .fontSize(16)
                .fontColor('#666666')
            }
            .width('100%')
            .justifyContent(FlexAlign.SpaceBetween)
            .margin({ top: 15 })
          }
          .width('90%')
          .padding(15)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 10 })

          Button('保存设置')
            .width('90%')
            .height(56)
            .backgroundColor('#1890FF')
            .fontSize(18)
            .margin({ top: 30 })
            .onClick(() => this.saveSettings())

          Button('退出登录')
            .width('90%')
            .height(56)
            .backgroundColor('#FFFFFF')
            .fontColor('#FF4D4F')
            .fontSize(18)
            .margin({ top: 15 })
            .border({ width: 1, color: '#FF4D4F' })
            .onClick(() => {
              prompt.showToast({ message: '退出登录' });
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
  }
}