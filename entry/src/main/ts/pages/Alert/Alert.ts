import router from '@system.router';
import prompt from '@system.prompt';
import alertService from '../services/AlertService';

@Entry
@Component
struct AlertPage {
  @State alerts: AlertItem[] = [];
  @State thresholds: ThresholdConfig = {
    bloodPressureSys: { min: 90, max: 140 },
    bloodPressureDia: { min: 60, max: 90 },
    heartRate: { min: 60, max: 100 },
    temperature: { min: 36.0, max: 37.3 }
  };
  @State showThresholdDialog: boolean = false;
  @State editingThreshold: string = 'bloodPressureSys';
  @State thresholdMin: string = '';
  @State thresholdMax: string = '';

  aboutToAppear() {
    this.loadAlerts();
    this.loadThresholds();
  }

  async loadAlerts() {
    this.alerts = await alertService.getAlerts();
  }

  async loadThresholds() {
    this.thresholds = await alertService.getThresholds();
  }

  openThresholdDialog(type: string) {
    this.editingThreshold = type;
    const config = this.thresholds[type];
    if (config) {
      this.thresholdMin = config.min.toString();
      this.thresholdMax = config.max.toString();
    }
    this.showThresholdDialog = true;
  }

  async saveThreshold() {
    await alertService.setThreshold(this.editingThreshold, {
      min: parseFloat(this.thresholdMin),
      max: parseFloat(this.thresholdMax)
    });
    prompt.showToast({ message: '阈值已保存' });
    this.showThresholdDialog = false;
    this.loadThresholds();
  }

  getAlertLevelColor(level: string): string {
    switch (level) {
      case 'critical':
        return '#FF4D4F';
      case 'warning':
        return '#FAAD14';
      default:
        return '#1890FF';
    }
  }

  getAlertLevelText(level: string): string {
    switch (level) {
      case 'critical':
        return '严重';
      case 'warning':
        return '警告';
      default:
        return '提示';
    }
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
          Text('异常预警')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
          Blank()
          Image($r('app.media.icon_settings'))
            .width(28)
            .height(28)
            .margin({ right: 10 })
            .onClick(() => this.showThresholdDialog = true)
        }
        .width('100%')
        .height(60)
        .padding({ left: 10, right: 10 })

        Column() {
          Text('阈值设置')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin({ left: 20, top: 15 })
            .alignSelf(HorizontalAlign.Start)

          Row() {
            Text('血压(收缩压)')
              .fontSize(14)
            Blank()
            Text(`${this.thresholds.bloodPressureSys.min}-${this.thresholds.bloodPressureSys.max} mmHg`)
              .fontSize(14)
              .fontColor('#1890FF')
          }
          .width('90%')
          .height(50)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .padding({ left: 15, right: 15 })
          .margin({ top: 10 })
          .onClick(() => this.openThresholdDialog('bloodPressureSys'))

          Row() {
            Text('血压(舒张压)')
              .fontSize(14)
            Blank()
            Text(`${this.thresholds.bloodPressureDia.min}-${this.thresholds.bloodPressureDia.max} mmHg`)
              .fontSize(14)
              .fontColor('#1890FF')
          }
          .width('90%')
          .height(50)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .padding({ left: 15, right: 15 })
          .margin({ top: 10 })
          .onClick(() => this.openThresholdDialog('bloodPressureDia'))

          Row() {
            Text('心率')
              .fontSize(14)
            Blank()
            Text(`${this.thresholds.heartRate.min}-${this.thresholds.heartRate.max} 次/分`)
              .fontSize(14)
              .fontColor('#1890FF')
          }
          .width('90%')
          .height(50)
          .backgroundColor('#FFFFFF')
          .borderRadius(8)
          .padding({ left: 15, right: 15 })
          .margin({ top: 10 })
          .onClick(() => this.openThresholdDialog('heartRate'))

          Text('预警记录')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin({ left: 20, top: 25 })
            .alignSelf(HorizontalAlign.Start)

          if (this.alerts.length === 0) {
            Column() {
              Image($r('app.media.icon_empty'))
                .width(60)
                .height(60)
              Text('暂无预警记录')
                .fontSize(14)
                .fontColor('#999999')
                .margin({ top: 10 })
            }
            .width('100%')
            .height(150)
            .justifyContent(FlexAlign.Center)
          } else {
            ForEach(this.alerts, (alert: AlertItem) => {
              Column() {
                Row() {
                  Text(this.getAlertLevelText(alert.level))
                    .fontSize(14)
                    .fontColor(this.getAlertLevelColor(alert.level))
                  Blank()
                  Text(alert.dataType)
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                  Blank()
                  Text(`${alert.value}`)
                    .fontSize(18)
                    .fontWeight(FontWeight.Bold)
                    .fontColor('#FF4D4F')
                }
                .width('100%')
                .justifyContent(FlexAlign.SpaceBetween)

                Text(alert.description)
                  .fontSize(14)
                  .fontColor('#666666')
                  .margin({ top: 5 })
                  .alignSelf(HorizontalAlign.Start)

                Text(this.formatTime(alert.createdAt))
                  .fontSize(12)
                  .fontColor('#999999')
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
        }
        .width('100%')
        .flexGrow(1)
        .alignItems(HorizontalAlign.Center)
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#F5F5F5')

      if (this.showThresholdDialog) {
        Column() {
          Text('设置阈值')
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .margin({ bottom: 20 })

          Text(this.getThresholdName(this.editingThreshold))
            .fontSize(16)
            .margin({ bottom: 20 })

          Row() {
            Text('最小值：')
              .fontSize(16)
            TextInput({ placeholder: '最小值', text: this.thresholdMin })
              .type(InputType.Number)
              .width(100)
              .height(48)
              .backgroundColor('#F5F5F5')
              .onChange((value) => this.thresholdMin = value)
          }
          .width('90%')
          .justifyContent(FlexAlign.Center)
          .margin({ bottom: 15 })

          Row() {
            Text('最大值：')
              .fontSize(16)
            TextInput({ placeholder: '最��值', text: this.thresholdMax })
              .type(InputType.Number)
              .width(100)
              .height(48)
              .backgroundColor('#F5F5F5')
              .onChange((value) => this.thresholdMax = value)
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
              .onClick(() => this.showThresholdDialog = false)
            Blank()
            Button('保存')
              .width(120)
              .height(48)
              .backgroundColor('#1890FF')
              .onClick(() => this.saveThreshold())
          }
          .width('90%')
          .justifyContent(FlexAlign.SpaceBetween)
        }
        .width('100%')
        .height('50%')
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

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }

  getThresholdName(type: string): string {
    const names: { [key: string]: string } = {
      bloodPressureSys: '血压(收缩压)',
      bloodPressureDia: '血压(舒张压)',
      heartRate: '心率',
      temperature: '体温'
    };
    return names[type] || type;
  }
}

interface ThresholdConfig {
  bloodPressureSys: { min: number; max: number };
  bloodPressureDia: { min: number; max: number };
  heartRate: { min: number; max: number };
  temperature: { min: number; max: number };
}

interface AlertItem {
  id: number;
  userId: string;
  dataType: string;
  value: number;
  threshold: number;
  level: string;
  description: string;
  createdAt: number;
}