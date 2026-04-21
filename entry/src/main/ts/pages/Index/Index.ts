import router from '@system.router';

@Entry
@Component
struct Index {
  @State currentIndex: number = 0;

  build() {
    Column() {
      Text('智慧医养')
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text('欢迎使用社区智慧医养监护系统')
        .fontSize(16)
        .margin({ top: 10 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}