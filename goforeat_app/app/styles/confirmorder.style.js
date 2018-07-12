import {StyleSheet,Platform} from 'react-native';
import GLOBAL_PARAMS from '../utils/global_params';
import Colors from '../utils/Colors';
export default StyleSheet.create({
  //_renderPopupDialogView
  CommonListItem: {
    justifyContent: 'space-between',
  },
  Footer: {
    backgroundColor:Colors.main_white, borderTopWidth: 0, borderBottomLeftRadius: 10, borderBottomRightRadius: 10
  },
  ConfirmBtn: {
    flex: 1,
    marginTop: 5,
    backgroundColor: '#FF3348',
    marginLeft: 40,
    marginRight: 40
  },
  ConfirmBtnText: {
    color: Colors.main_white,
    fontWeight: "600",
    fontSize: 16
  },
  //_renderNewOrderView
  NewsInner: {flexDirection: 'row',
  alignItems:'center',
  justifyContent:'space-between'},
  FoodName: {color: '#111111',fontSize: 18,flex:1,fontWeight:'600'},
  FoodMoney:{color:'#111111',fontSize: 18},
  CountView: {flexDirection: 'row',alignItems:'center'},
  CountText: {color: '#999999',fontSize:16,marginRight: 5},
  FoodNum: {color: Colors.middle_red,fontSize: 16},
  TotalText: {flex: 1,fontSize: 18,color: '#333333',},
  CouponText: {flex: 1,fontSize: 14,color: '#333333'},
  MoneyUnit: {fontSize: 20,color: '#111111',marginRight: 5},
  CouponUnit: {fontSize: 14,color: '#111111',marginRight: 5},
  TotalMoney: {fontSize: 22,color: '#ff3448',marginTop: -2,fontWeight:'600'},
  CouponMoney: {fontSize: 16,color: '#ff3448',marginTop: -2,fontWeight:'600'},
  //renderNewDetailsVew
  Title:{color:'#111111',fontSize: 20,fontWeight:'bold'},
  //renderCommonDetailView
  DetailText: {flexDirection: 'row',justifyContent:'space-between',alignItems:'center',flex: 1,borderBottomWidth:1,borderBottomColor:'#EBEBEB',paddingBottom:10},
  DetailInner: {flexDirection:'row',alignItems:'center',flex:1},
  ArrowDown:{width: 20,height: 20,color:'#C8C7C7',marginTop:-8},
  //renderCouponBtnView
  CouponInput: {
    backgroundColor:'#F0EFF6',
    color: '#111111',
    fontSize: 14,
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 3,
    paddingLeft: 5,
    height: 40
  },
  CouponBtn: {
    backgroundColor: '#E1E0EA',
    // padding: Platform.OS == 'IOS' ? 12: 11,
    height: 40,
    paddingLeft: 25,
    paddingRight: 25,
    justifyContent: 'center',
    borderBottomRightRadius: 3,
    borderTopRightRadius: 3,
  },
  CouponText: {
    color: '#FF3348'
  }
})