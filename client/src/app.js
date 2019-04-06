import Taro, { Component } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'
import './widgets/IndexBar/index.scss'
// import 'taro-ui/dist/style/index.scss'
// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/Chat/index',
      'pages/Diary/index',
      'pages/DataCenter/index',
      'pages/MyCenter/index'
    ],
    tabBar: {
      list: [
        {
          pagePath: "pages/index/index",
          text: "首页",
          iconPath: "./assets/images/home-black.png",
          selectedIconPath: "./assets/images/home-blue.png"
        },
        {
          pagePath: "pages/Chat/index",
          text: "研友中心",
          iconPath: "./assets/images/chat.png",
          selectedIconPath: "./assets/images/chat-selected.png"
        },
        {
          pagePath: "pages/Diary/index",
          text: "微日记",
          iconPath: "./assets/images/diary-black.png",
          selectedIconPath: "./assets/images/diary-blue.png"
        },
        {
          pagePath: "pages/DataCenter/index",
          text: "资料圈",
          iconPath: "./assets/images/data-black.png",
          selectedIconPath: "./assets/images/data-blue.png"
        },
        {
          pagePath: "pages/MyCenter/index",
          text: "个人中心",
          iconPath: "./assets/images/my-black.png",
          selectedIconPath: "./assets/images/my-blue.png"
        }],
        selectedColor:'#4a72ea'
    },
    window: {
      enablePullDownRefresh:true,
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#282b2e',
      navigationBarTitleText: '考研帮',
      navigationBarTextStyle: 'white',
      // navigationStyle: "custom",设置导航栏与上面的颜色一致
      backgroundColor: '#282b2e',
      // onReachBottomDistance:50
    }
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
