import router from '@system.router';
import prompt from '@system.prompt';

@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  @State userName: string = '用户';
  @State healthSummary: HealthSummary = {
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.5
  };

  build() {
    Column() {
      Stack({ alignContent: Alignment.Top }) {
        Column() {
          Row() {
            Text('智慧医养')
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .margin({ left: 20 })
            Blank()
            Image($r('app.media.icon_settings'))
              .width(32)
              .height(32)
              .margin({ right: 20 })
              .onClick(() => router.push({ uri: 'pages/Settings/Settings' }))
          }
          .width('100%')
          .height(60)
          .padding({ top: 10 })
        }

        Column() {
          Text(this.userName + '，您好')
            .fontSize(20)
            .margin({ top: 80, left: 20 })
        }
        .width('100%')
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .height(160)
      .backgroundColor('#F5F5F5')

      Column() {
        Row() {
          this.HealthCard({
            title: '血压',
            value: this.healthSummary.bloodPressure,
            unit: 'mmHg',
            icon: $r('app.media.icon_blood_pressure')
          })
          Blank()
          this.HealthCard({
            title: '心率',
            value: this.healthSummary.heartRate.toString(),
            unit: '次/分',
            icon: $r('app.media.icon_heart')
          })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .padding({ left: 20, right: 20 })

        Row() {
          this.QuickAction({
            title: '健康录入',
            icon: $r('app.media.icon_health_input'),
            onClick: () => router.push({ uri: 'pages/Health/Health' })
          })
          Blank()
          this.QuickAction({
            title: '智能提醒',
            icon: $r('app.media.icon_reminder'),
            onClick: () => router.push({ uri: 'pages/Reminder/Reminder' })
          })
          Blank()
          this.QuickAction({
            title: '异常预警',
            icon: $r('app.media.icon_alert'),
            onClick: () => router.push({ uri: 'pages/Alert/Alert' })
          })
          Blank()
          this.QuickAction({
            title: '亲情关怀',
            icon: $r('app.media.icon_family'),
            onClick: () => router.push({ uri: 'pages/FamilyCare/FamilyCare' })
          })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .padding({ left: 20, right: 20, top: 30 })
      }
      .width('100%')
      .flexGrow(1)

      Row() {
        Column() {
          Image($r('app.media.icon_home'))
            .width(28)
            .height(28)
          Text('首页')
            .fontSize(14)
        }
        .layoutWeight(1)
        .onClick(() => this.currentIndex = 0)

        Column() {
          Image($r('app.media.icon_health'))
            .width(28)
            .height(28)
          Text('健康')
            .fontSize(14)
        }
        .layoutWeight(1)
        .onClick(() => router.push({ uri: 'pages/Health/Health' }))

        Column() {
          Image($r('app.media.icon_care'))
            .width(28)
            .height(28)
          Text('关怀')
            .fontSize(14)
        }
        .layoutWeight(1)
        .onClick(() => router.push({ uri: 'pages/FamilyCare/FamilyCare' }))

        Column() {
          Image($r('app.media.icon_settings'))
            .width(28)
            .height(28)
          Text('设置')
            .fontSize(14)
        }
        .layoutWeight(1)
        .onClick(() => router.push({ uri: 'pages/Settings/Settings' }))
      }
      .width('100%')
      .height(80)
      .backgroundColor('#FFFFFF')
      .border({ width: { top: 1 }, color: '#E0E0E0' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }

  @Component
  struct HealthCard {
    private title: string;
    private value: string;
    private unit: string;
    private icon: Resource;

    build() {
      Column() {
        Row() {
          Image(this.icon)
            .width(24)
            .height(24)
          Text(this.title)
            .fontSize(16)
            .margin({ left: 8 })
        }
        Text(this.value)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin({ top: 10 })
        Text(this.unit)
          .fontSize(14)
          .fontColor('#999999')
      }
      .width(160)
      .height(120)
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
      .padding(15)
    }
  }

  @Component
  struct QuickAction {
    private title: string;
    private icon: Resource;
    private onClick: () => void;

    build() {
      Column() {
        Image(this.icon)
          .width(40)
          .height(40)
        Text(this.title)
          .fontSize(14)
          .margin({ top: 8 })
      }
      .width(80)
      .height(90)
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .onClick(this.onClick)
    }
  }
}

interface HealthSummary {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
}