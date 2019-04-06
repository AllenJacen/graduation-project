import Taro,{Component} from '@tarojs/taro'
import { View, Text ,Input } from '@tarojs/components' 
require('./index.scss');

export default class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentWillMount(){}

    componentDidMount(){}

    componentWillReceiveProps(){}

    shouldComponentUpdate(){}

    componentWillUpdate(){}

    componentDidUpdate(){}

    render() {
        return (
            <View className='index'>
            <View className='input'>
            hello
            </View>
            </View>
        )
    }

    
}