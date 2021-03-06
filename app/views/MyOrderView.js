import React, { Component } from "react";
import { View, TouchableOpacity,Alert,Platform,Image } from "react-native";
import {
  Container,
  Tabs,
  Tab,
  TabHeading,
} from "native-base";
//utils
import GLOBAL_PARAMS,{EXPLAIN_PAY_TYPE, isEmpty} from '../utils/global_params';
import ToastUtil from '../utils/ToastUtil';
//api
import {myOrder,cancelOrder} from '../api/request';
//components
import CommonHeader from '../components/CommonHeader';
import Text from '../components/UnScalingText';
import CommonFlatList from '../components/CommonFlatList';
//language
import I18n from '../language/i18n';
//styles
import MyOrderStyles from '../styles/myorder.style';
import CommonStyles from '../styles/common.style';

const _TAB_DELIVERING = 0;
const _TAB_FINISHED = 1;
const _TAB_CANCEL = 2;
const _TAB_ALL = 3;

const _ORDER_CANCEL = -1;
const _ORDER_DELIVERING = 1;
const _ORDER_FINISHED = 2;
const _ORDER_ALL = null;

export default class PeopleView extends Component {
  timer = null;
  _tabs = null;
  _current_tab = _TAB_DELIVERING;
  _delivering_list = [];
  _section_list = null;
  _is_mounted = true;

  constructor(props) {
    super(props);
    this.state = {
    currentTab: _TAB_DELIVERING,
    currentStatus: _ORDER_DELIVERING,
    i18n: I18n[props.screenProps.language],
    hasDelivering: false,
    listCount: 0
    }
  }
  
  //private function

  _cancelOrder(orderId, currentPayment, status) {
    let {i18n, currentTab} = this.state;
    const cancelRefresh = () => {
      if(!isEmpty(this[`${_TAB_ALL}flatlist`])) {
        this[`${_TAB_ALL}flatlist`].outSideRefresh();
      }
      this[`${_TAB_DELIVERING}flatlist`].outSideRefresh();
    };
    Alert.alert(
      i18n.tips,
      i18n.myorder_tips.common.cancel_order,
      [
        {text: i18n.cancel, onPress: () => {return null}, style: 'cancel'},
        {text: i18n.confirm, onPress: () => {
          cancelOrder(orderId).then(data => {
            if(data.ro.respCode == '0000') {
              ToastUtil.showWithMessage(i18n.myorder_tips.success.cancel_order);
              
              cancelRefresh();
            }else {
              ToastUtil.showWithMessage(data.ro.respMsg)
            }
          },() => {
            ToastUtil.showWithMessage(i18n.common_tips.err);
          })
        }},
      ],
      { cancelable: false }
    )
  }


  _switchOrderStatus(status) {
    let {i18n} = this.state;
    switch(status) {
      case -1: return i18n.userCancel;
      case 0: return i18n.unconfirm;
      case 1: return i18n.delivering;
      case 2: return i18n.finish;
    }
  }

  _onChangeTabs(val) {
    if(this._tabs.state.currentPage == this.state.currentTab) {
      return;
    }
      this.setState({
        currentTab: this._tabs.state.currentPage,
      });
  }

  _getListCount(count, tab) {
    if(tab != _TAB_DELIVERING) return;
    this.setState({
      listCount: count
    })
  }

  //render view

  _renderNewListItemView(item,index) {
    return (
      <View style={{padding: 20,backgroundColor:'#fff'}} key={index}>
        {this._renderFoodDetailView(item)}
        {this._renderPayView(item)}
        {this._renderTotalPriceView(item)}
      </View>
    )
  }

  _renderFoodDetailView(item) {
    let {i18n} = this.state;
    let {language} = this.props.screenProps;
    let _picture = !item.picture ? require('../asset/default_pic.png') : {uri:item.picture};
    return (
      <View style={MyOrderStyles.FoodContainer}>
      <Image style={MyOrderStyles.FoodImage}
                    reasizeMode="contain" source={_picture}
                  />
        <View style={MyOrderStyles.FoodInnerContainer}>
          <View style={MyOrderStyles.FoodTitleView}>
            <Text style={[CommonStyles.common_title_text,{maxWidth: GLOBAL_PARAMS.em(130)}]} numberOfLines={1}>{item.orderName}</Text>
            <View style={{flexDirection:'row',marginTop: -2}}>
              <Text style={[CommonStyles.common_title_text,{marginRight: 5}]}>{i18n.quantity}:</Text>
              <Text style={CommonStyles.common_important_text}>{item.amount}</Text>
            </View>
          </View>
          <View style={MyOrderStyles.FoodCommonView}>
            <Text style={CommonStyles.common_info_text}>{i18n.foodTime}</Text>
            <Text style={[CommonStyles.common_info_text,{maxWidth: GLOBAL_PARAMS.em(180)}]} numberOfLines={1}>{item.takeTimeNew}</Text>
          </View>
          <View style={MyOrderStyles.FoodCommonView}>
            <Text style={CommonStyles.common_info_text}>{i18n.foodAddress}</Text>
            <Text style={[CommonStyles.common_info_text,{maxWidth: GLOBAL_PARAMS.em(180)}]} numberOfLines={1}>{item.takeAddressDetail}</Text>
          </View>
          <View style={MyOrderStyles.FoodCommonView}>
            <Text style={CommonStyles.common_info_text}>{i18n.paymentStatus}</Text>
            <Text style={[CommonStyles.common_info_text,{maxWidth: GLOBAL_PARAMS.em(180)}]} numberOfLines={1}>{EXPLAIN_PAY_TYPE[item.payment || 1][language] || i18n.cash}</Text>
          </View>
        </View>
      </View>
    )
  }

  _renderPayView(item) {
    let _isDelivering = item.status === _ORDER_DELIVERING;
    let {i18n} = this.state;
    
    return (
      <View style={MyOrderStyles.payContainer}>
        <Text style={MyOrderStyles.paymentStatus}>取餐號:{item.mealCode}</Text>
        <View style={MyOrderStyles.payInner}>
          {_isDelivering ? <TouchableOpacity onPress={() => this._cancelOrder(item.orderId, EXPLAIN_PAY_TYPE[item.payment],item.status)} style={MyOrderStyles.payStatusBtn}>
            <Text style={MyOrderStyles.payStatusText}>{i18n.myorder_tips.common.cancel_order_btn}</Text>
          </TouchableOpacity> : null}
        </View>
      </View>
    )
  }

  _renderTotalPriceView(item) {
    let _isDelivering = item.status === _ORDER_DELIVERING;
    let {i18n} = this.state;
    return (
      <View style={MyOrderStyles.totalContainer}>
        <View style={{backgroundColor: 'transparent'}}>
            <Text style={MyOrderStyles.totalStatusText}>{this._switchOrderStatus(item.status)}</Text>
          </View>
       <View style={MyOrderStyles.totalInnerView}>
        <Text style={MyOrderStyles.totalUnitText}>{i18n.total} HKD</Text>
        <Text style={MyOrderStyles.totalPriceText}>{item.totalMoney}</Text>
       </View>
      </View>
    )
  }

  render() {
    let {i18n,listCount} = this.state;
    let _order_arr = [
      {title: i18n.delivering, tab: _TAB_DELIVERING, status: _ORDER_DELIVERING},
      {title: i18n.finished, tab: _TAB_FINISHED, status: _ORDER_FINISHED},
      {title: i18n.cancelOrder, tab: _TAB_CANCEL, status: _ORDER_CANCEL},
      {title: i18n.all, tab: _TAB_ALL, status: _ORDER_ALL},
    ];
    return (
      <Container style={{position: 'relative'}}>
        <CommonHeader hasMenu hasTabs title={i18n.myorder}/>
        <Tabs tabBarUnderlineStyle={MyOrderStyles.tabBarUnderlineStyle} 
        ref={ t=>this._tabs = t } onChangeTab={() => this._onChangeTabs()}>
          {
            _order_arr.map((item,key) => (
              <Tab key={key} heading={ <TabHeading style={MyOrderStyles.commonHeadering}><Text allowFontScaling={false} style={[MyOrderStyles.commonText,{fontWeight: this.state.currentTab == item.tab? '800':'normal',}]}>{item.title}</Text>
                {listCount > 0&&item.status == _ORDER_DELIVERING?<Image source={require('../asset/Oval.png')} style={MyOrderStyles.activeRedTips}/> : null}
              </TabHeading>}>
                <CommonFlatList style={{backgroundColor: '#efefef'}} ref={cfl => this[`${item.tab}flatlist`] = cfl} requestFunc={myOrder} extraParams={{status: item.status}} renderItem={(index,item) => this._renderNewListItemView(index,item)} isBlankInfoBtnShow isItemSeparatorShow blankBtnMessage={i18n.common_tips.no_data} blankBtnFunc={() => this.props.navigation.goBack()} getCount={(count) => this._getListCount(count, item.tab)} {...this.props}/>
              </Tab>
            ))
          }
        </Tabs>  
      </Container>
    );
  }
}
