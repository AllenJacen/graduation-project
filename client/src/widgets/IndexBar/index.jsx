import Taro,{Component} from '@tarojs/taro'
import { View, Text ,Input } from '@tarojs/components' 
import { AtCountdown, AtSearchBar ,AtCalendar } from 'taro-ui'
import { CountDown } from '@/components/CountDown/index'
require('./index.scss');

export default class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
          }
        }
        onChange (value) {
          this.setState({
            value: value
          })
        }
    componentWillMount(){}

    componentDidMount(){}

    componentWillReceiveProps(){}

    shouldComponentUpdate(){}

    componentWillUpdate(){}

    componentDidUpdate(){}

    render() {
        return (
            <View className='bar'>
            <AtSearchBar className='mysearch' value={this.state.value}  onChange={this.onChange.bind(this)} />
            {/* <CountDown endTime="2019-12-22"/> */}
            </View>
        )
    }

    
}