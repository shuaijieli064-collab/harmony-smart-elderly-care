import router from '@system.router';
import prompt from '@system.prompt';
import medicalDataService from '../services/MedicalDataService';

@Entry
@Component
struct Health {
  @State bloodPressureSys: string = '';
  @State bloodPressureDia: string = '';
  @State heartRate: string = '';
  @State temperature: string = '';
  @State records: HealthRecord[] = [];
  @State isLoading: boolean = false;

  aboutToAppear() {
    this.loadRecords();
  }

  async loadRecords() {
    this.isLoading = true;
    this.records = await medicalDataService.getHealthRecords();
    this.isLoading = false;
  }

  async submitData() {
    if (!this.bloodPressureSys || !this.bloodPressureDia || !this.heartRate) {
      prompt.showToast({ message: '请填写完整数据' });
      return;
    }

    const data: HealthData = {
      type: 'bloodPressure',
      value: parseFloat(this.bloodPressureSys),
      diastolic: parseFloat(this.bloodPressureDia),
      heartRate: parseFloat(this.heartRate),
      temperature: this.temperature ? parseFloat(this.temperature) : 0,
      recordedAt: Date.now()
    };

    await medicalDataService.saveHealthData(data);
    prompt.showToast({ message: '数据保存成功' });
    this.clearForm();
    this.loadRecords();
  }

  clearForm() {
    this.bloodPressureSys = '';
    this.bloodPressureDia = '';
    this.heartRate = '';
    this.temperature = '';
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
        Text('健康数据')
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
          Text('录入健康数据')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 10, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          Column() {
            Text('血压 (mmHg)')
              .fontSize(16)
              .margin({ bottom: 10 })
              .alignSelf(HorizontalAlign.Start)
            Row() {
              TextInput({ placeholder: '收缩压' })
                .type(InputType.Number)
                .width(140)
                .height(56)
                .backgroundColor('#F5F5F5')
                .onChange((value) => this.bloodPressureSys = value)
              Text(' / ')
                .fontSize(20)
              TextInput({ placeholder: '舒张压' })
                .type(InputType.Number)
                .width(140)
                .height(56)
                .backgroundColor('#F5F5F5')
                .onChange((value) => this.bloodPressureDia = value)
            }
          }
          .width('100%')
          .padding(20)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 15, left: 20, right: 20 })

          Column() {
            Text('心率 (次/分)')
              .fontSize(16)
              .margin({ bottom: 10 })
              .alignSelf(HorizontalAlign.Start)
            TextInput({ placeholder: '请输入心率' })
              .type(InputType.Number)
              .width('100%')
              .height(56)
              .backgroundColor('#F5F5F5')
              .onChange((value) => this.heartRate = value)
          }
          .width('100%')
          .padding(20)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 15, left: 20, right: 20 })

          Column() {
            Text('体温 (℃)')
              .fontSize(16)
              .margin({ bottom: 10 })
              .alignSelf(HorizontalAlign.Start)
            TextInput({ placeholder: '请输入体温' })
              .type(InputType.Number)
              .width('100%')
              .height(56)
              .backgroundColor('#F5F5F5')
              .onChange((value) => this.temperature = value)
          }
          .width('100%')
          .padding(20)
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .margin({ top: 15, left: 20, right: 20 })

          Button('保存数据')
            .width('90%')
            .height(56)
            .backgroundColor('#1890FF')
            .fontSize(18)
            .margin({ top: 30 })
            .onClick(() => this.submitData())

          Text('历史记录')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .margin({ top: 30, left: 20 })
            .alignSelf(HorizontalAlign.Start)

          ForEach(this.records, (record: HealthRecord) => {
            Column() {
              Row() {
                Text(record.type)
                  .fontSize(16)
                Blank()
                Text(this.formatTime(record.recordedAt))
                  .fontSize(14)
                  .fontColor('#999999')
              }
              .width('100%')
              .justifyContent(FlexAlign.SpaceBetween)

              Text(record.value)
                .fontSize(20)
                .fontWeight(FontWeight.Bold)
                .margin({ top: 8 })
                .alignSelf(HorizontalAlign.Start)
            }
            .width('100%')
            .padding(15)
            .backgroundColor('#FFFFFF')
            .borderRadius(12)
            .margin({ top: 10, left: 20, right: 20 })
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

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
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