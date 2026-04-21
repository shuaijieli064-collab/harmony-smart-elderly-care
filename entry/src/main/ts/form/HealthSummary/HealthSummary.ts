import formBindingData from '@ohos.app.form.formBindingData';
import formProvider from '@ohos.app.form.formProvider';

@Entry
@Component
struct HealthSummary {
  @State healthStatus: string = '正常';
  @State statusColor: string = '#52C41A';
  @State alertCount: number = 0;
  @State reminderCount: number = 0;

  aboutToAppear() {
    this.loadData();
  }

  async loadData() {
    this.alertCount = 0;
    this.reminderCount = 0;
    this.healthStatus = '正常';
    this.statusColor = '#52C41A';
  }

  build() {
    Column() {
      Row() {
        Text('健康状态')
          .fontSize(12)
          .fontColor('#666666')
        Blank()
        Text(this.healthStatus)
          .fontSize(12)
          .fontColor(this.statusColor)
          .fontWeight(FontWeight.Medium)
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin({ bottom: 8 })

      Row() {
        Column() {
          Image($r('app.media.icon_alert'))
            .width(24)
            .height(24)
          Text(`${this.alertCount}`)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
          Text('预警')
            .fontSize(10)
            .fontColor('#999999')
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)

        Column() {
          Image($r('app.media.icon_reminder'))
            .width(24)
            .height(24)
          Text(`${this.reminderCount}`)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
          Text('提醒')
            .fontSize(10)
            .fontColor('#999999')
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Center)
      }
      .width('100%')
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#FFFFFF')
    .borderRadius(16)
  }
}

export default HealthSummary;