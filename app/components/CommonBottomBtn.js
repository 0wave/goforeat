import React from 'react';
import PropTypes from 'prop-types';
import { View,TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
//styles
import CommonStyles from '../styles/common.style';
//components
import Text from './UnScalingText';
//utils
import {em} from '../utils/global_params';



/**
 *底部公用渐变btn
 *
 * @param {*} clickFunc func
 * @returns element
 */
const CommonBottomBtn = props => {
  return (
    <View style={[CommonStyles.common_btn_container,props.containerStyle]}>
      <TouchableOpacity onPress={props.clickFunc}>
        <LinearGradient colors={['#FF9F48','#FF4141']} start={{x:0.0, y:0.0}} end={{x:1.0,y: 0.0}} style={[CommonStyles.btn,props.style]}>
          <Text style={{color:'#fff',fontSize:em(17),backgroundColor:'transparent',fontWeight:"700",}}>{props.children}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

CommonBottomBtn.defaultProps = {
  clickFunc: () => {},
  style: {},
  containerStyle: {}
}

CommonBottomBtn.propsType = {
  clickFunc: PropTypes.func,
  style: PropTypes.object,
  containerStyle: PropTypes.object
}

export default CommonBottomBtn;