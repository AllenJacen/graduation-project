import Taro, { Component } from '@tarojs/taro'
import { View, Text ,Input } from '@tarojs/components'
// import { NavBar } from 'component/NavBar/index'
import './index.scss'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '微日记'
  }
  constructor(props){
    super(props);
    this.state = {
      list: [
        'get up',
        'coding',
        'sleep',
      ],
      inputVal: ''
    }
  }
  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  addItem () {
    let { list } = this.state
    const inputVal = this.inputVal
    if (inputVal == '') return
    else{
      list.push(inputVal)
    }
    let clearVal = (this.state.inputVal == null ? '' : null)
    this.setState({
      list,
      inputVal:clearVal
    })
  }
  inputHandler (e) {
    // 不参与渲染的变量可不使用state储存，提高性能
    this.inputVal = e.target.value
  }


  delItem (index) {
    let { list } = this.state
    list.splice(index, 1)
    this.setState({
      list
    })
  }

  render () {
    let { list , inputVal} = this.state;
    return (
      <View className='index'>
        <Input className='input' type='text' value={inputVal} onInput={this.inputHandler.bind(this)} />
        <Text className='add' onClick={this.addItem.bind(this)}>添加</Text>
        <View className='list_wrap'>
          <Text>Todo list</Text>
          {
            list.map((item, index) => {
              return <View className='list'>
                <Text>{index + 1}.{item}</Text>
                <Text className='del' onClick={this.delItem.bind(this, index)}>删除</Text>
              </View>
            })
          }
        </View>
        {/* <NavBar /> */}
      </View>
    )
  }
}

