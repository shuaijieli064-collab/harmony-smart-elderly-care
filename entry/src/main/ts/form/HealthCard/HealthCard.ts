import formBindingData from '@ohos.app.form.formBindingData';
import formProvider from '@ohos.app.form.formProvider';
import wantAgent from '@ohos.wantAgent';
import reminderService from '../services/ReminderService';

@Entry
@Component
struct HealthCard {
  @State bloodPressure: string = '120/80';
  @State heartRate: string = '72';
  @State temperature: string = '36.5';
  @State lastUpdate: string = '';

  async aboutToAppear() {
    await this.loadLatestData();
  }

  async loadLatestData() {
    const now = new Date();
    this.lastUpdate = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  updateFormData() {
    const formData = {
      bloodPressure: this.bloodPressure,
      heartRate: this.heartRate,
      temperature: this.temperature,
      lastUpdate: this.lastUpdate
    };
    return formBindingData.createFormBindingData(formData);
  }

  onEvent(info) {
    if (info) {
      this.loadLatestData();
      formProvider.updateForm(info.formId, this.updateFormData());
    }
  }

  build() {
    Column() {
      Column() {
        Text('健康概览')
          .fontSize(12)
          .fontColor('#666666')
          .margin({ bottom: 8 })

        Row() {
          Column() {
            Text('血压')
              .fontSize(10)
              .fontColor('#999999')
            Text(this.bloodPressure)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
            Text('mmHg')
              .fontSize(8)
              .fontColor('#999999')
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Center)

          Column() {
            Text('心率')
              .fontSize(10)
              .fontColor('#999999')
            Text(this.heartRate)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
            Text('次/分')
              .fontSize(8)
              .fontColor('#999999')
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Center)

          Column() {
            Text('体温')
              .fontSize(10)
              .fontColor('#999999')
            Text(this.temperature)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
            Text('℃')
              .fontSize(8)
              .fontColor('#999999')
          }
          .layoutWeight(1)
          .alignItems(HorizontalAlign.Center)
        }
        .width('100%')

        Text(`更新于 ${this.lastUpdate}`)
          .fontSize(8)
          .fontColor('#BBBBBB')
          .margin({ top: 8 })
      }
      .width('100%')
      .padding(12)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF')
    .borderRadius(16)
  }
}

export default HealthCard;