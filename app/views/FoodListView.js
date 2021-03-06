import React, {Component} from 'react'
import {View,TouchableOpacity,StyleSheet,Image,Platform,ActivityIndicator,Linking,Animated} from 'react-native'
import {
  Container,
  Header,
} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
//utils
import GLOBAL_PARAMS, { em, isEmpty } from '../utils/global_params';
import JSONUtils from '../utils/JSONUtils';
import {getDeviceId} from "../utils/DeviceInfo";
import BackAndroidHandler from "../utils/BackAndroidHandler";
//api
import {getNewArticleList, adSpace} from '../api/request';
import source from '../api/CancelToken';
//components
import Text from '../components/UnScalingText';
import WarningTips from '../components/WarningTips';
import CommonFlatList from "../components/CommonFlatList";
import AdvertiseView from '../components/AdvertiseView';
import PlacePickerModel from '../components/PlacePickerModel';
//language
import I18n from '../language/i18n';
//styles
import FoodDetailsStyles from '../styles/fooddetails.style';
//storage
import {advertisementStorage} from '../cache/appStorage';

const { isIphoneX, bottomDistance, iPhoneXBottom, _winHeight, _winWidth } = GLOBAL_PARAMS;

class FoodListView extends Component {

  constructor(props) {
    super(props);
    this._interval = null;
    this._isFirstReload = true; //判断是否为首次加载
    this.state = {
      currentItem: '',
      placeSelected: null,
      advertiseImg: '',
      advertiseData: null,
      advertiseCountdown: 5,
      warningTipsData: [],
      star: null,
      isAdvertiseShow: false,
      isWarningTipShow: false,
      i18n: I18n[props.screenProps.language],
      progress: new Animated.Value(0)
    };
  }

  componentWillMount() {
    let {isAdShow, hideAd} = this.props.screenProps;
    if(isAdShow) {
      hideAd();
    }
    advertisementStorage.getData((error,data) => {
      if(error == null) {
        if(data != null) {
          isAdShow && this.setState({advertiseImg: data.image,advertiseData: data,isAdvertiseShow: true});
          this._advertiseInterval();
        }
        this._getAdvertise(data);
      }
    });
  }

  componentWillUnmount() {
    source.cancel();
    clearInterval(this._interval);
  }

  //logic functions

  _getAdvertise(old_data) {
    adSpace().then(data => {
      if(data.ro.respCode == '0000') {
        if(data.data.length == 0) { // 如果data为空，则不设置缓存为空
          advertisementStorage.setData(null);
          return;
        }
        if(old_data != null) { // 如果缓存不为空
          if(JSONUtils.jsonDeepCompare(old_data, data.data[0])) {
            return; // 判断缓存是否与服务器数据相等，如果相等则不做操作
          } else{ // 如果缓存不等则覆盖本地缓存为服务器数据
            advertisementStorage.setData(data.data[0]);
            Image.prefetch(data.data[0].image)
          }
        }else { // 如果缓存为空，则缓存到本地
          advertisementStorage.setData(data.data[0]);
          Image.prefetch(data.data[0].image)
        }
      }
    })
    .catch(err => {
      if (axios.isCancel(thrown)) {
        // console.log('Request canceled', thrown.message);
      } 
    })
  }

  _advertiseInterval() {
    this._interval = setInterval(() => {
      if(this.state.advertiseCountdown > 1) {
        this.setState({
          advertiseCountdown: this.state.advertiseCountdown - 1,
        })
      }else {
        this.setState({
          isAdvertiseShow: false
        })
        clearInterval(this._interval);
      }
    },1000)
  }

  _getSeletedValue(val) {
    if(val == null) {
      // this._picker.getPlace();
      this.setState({ isError: true, loading: false });
      return;
    }
    this.setState({
      placeSelected: val,
    },() => {
      if(!this._isFirstReload) {
        if(!!this.flatlist) this.flatlist.outSideRefresh();
        this._isFirstReload = false;
      } else {
        this._isFirstReload = false;
      }
    });
  }
  
  //render functions
  _renderAdvertisementView() {
    return (
      <AdvertiseView 
      modalVisible={this.state.isAdvertiseShow} seconds={this.state.advertiseCountdown} image={this.state.advertiseImg} data={this.state.advertiseData} countDown={this.state.advertiseCountdown}  closeFunc={() => this.setState({
        isAdvertiseShow: false
      })} {...this.props}
      />
    )
  }

  _renderRefreshBgView() {
    return (
      <LinearGradient colors={['#FF7F0B','#FF1A1A']} start={{x:0.0, y:0.0}} end={{x:1.0,y: 0.0}} style={{position:'absolute',top:0,left: 0,height: 150,width: _winWidth,overflow: 'hidden',}} />
    )
  }

  _renderStarView(progress) {
    return (
      <LottieView
        ref={lv => this._lv = lv}
        autoPlay={this.state.star==5}
        style={[{width: em(20),height: em(20),transform:[{scale:2.3}],position: 'absolute'},Platform.OS =='ios'? {top: em(0.5),left: em(-4)}:{}]}
        source={require('../animations/rating.json')}
        loop={false}
        progress={progress*10/20}
        enableMergePathsAndroidForKitKatAndAbove
      />
    )
  }
  
  _renderTopTitleView() {
    return (
      <View style={{marginTop: em(10), marginLeft: em(15),marginRight: em(15),
        justifyContent: 'space-between',flexDirection: 'row',position: 'relative'}}>
        <Text style={[FoodDetailsStyles.DateFormatWeekText, {color: '#333'}]}>
        精選菜品</Text>
        {
          Platform.OS === 'ios' ? (<Text>{this.state.star && this._renderStarView(this.state.star/5)}評分:{this.state.star}</Text>) : (
          <Text>評分:{this.state.star}</Text>
          )
        }
        
      </View>
    )
  }

  _renderWarningView() {
    return (
      <WarningTips {...this.props} />
    )
  }

  _renderHeaderView() {
    let {placeSelected} = this.state;
    let {navigate} = this.props.navigation;
    let scheme = '';
    if(placeSelected != null) {
      let {placeSelected: {lon, lat, name}} = this.state;
      scheme = Platform.select({
        android: `geo:${lon},${lat}?q=${name}`,
        ios: `http://maps.apple.com/?q=${name}&ll=${lon},${lat}`
      });
    }
    return (
      <Header
          style={FoodDetailsStyles.Header}
          iosBarStyle="light-content"
          androidStatusBarColor="#333"
        >
        <LinearGradient colors={['#FF7F0B','#FF1A1A']} start={{x:0.0, y:0.0}} end={{x:1.0,y: 0.0}} style={FoodDetailsStyles.linearGradient}>
          <TouchableOpacity onPress={() => navigate("DrawerOpen", { callback: this._add })} style={FoodDetailsStyles.MenuBtn}>
            <Image source={require('../asset/menu.png')} style={FoodDetailsStyles.MenuImage} resizeMode="contain"/>
          </TouchableOpacity>
          <View style={FoodDetailsStyles.HeaderContent}>
            {placeSelected != null ? this._renderPlacePickerBtn() : <ActivityIndicator color='#fff' size="small"/>}
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(scheme)} style={FoodDetailsStyles.MenuBtn}>
            <Image source={require('../asset/location_white.png')} style={FoodDetailsStyles.locationImage} resizeMode="contain"/>
          </TouchableOpacity>
        </LinearGradient>
      </Header>
    )
  }

  _renderPlacePickerBtn() {
    return (
      <TouchableOpacity style={FoodDetailsStyles.PlacePickerBtn} onPress={() => this.setState({showPlacePicker: true})}>
        <View style={FoodDetailsStyles.PlacePickerBtnBgAbsolute}/>
        <Text style={FoodDetailsStyles.PlacePickerBtnText} numberOfLines={1}>
          {this.state.placeSelected.name}
        </Text>
        <Image source={require('../asset/arrow_down.png')} style={FoodDetailsStyles.PlacePickerBtnImage} resizeMode="contain"/>
      </TouchableOpacity>
    )
  }

  _renderPlacePicker() {
    let {showPlacePicker} = this.state;
    return (
      <PlacePickerModel ref={c => this._picker = c} modalVisible={showPlacePicker} closeFunc={() => this.setState({showPlacePicker: false})} getSeletedValue={(val) => this._getSeletedValue(val)} {...this.props}/>
    )
  }

  _renderFoodListItemView (item,index) {
    if(typeof item === 'undefined') return;
    let _device = getDeviceId().split(",")[0];
    return (
      <TouchableOpacity style={styles.articleItemContainer}
        onPress={() => {
          this.props.navigation.navigate('Food', {dateFoodId: item.dateFoodId});
        }} activeOpacity={0.6}>
        <Image source={{uri: item.thumbnail}} style={{width: _winWidth*0.45 - 10,height: em(160)}} resizeMode="cover"/>
        <View style={styles.articleItemDetails}>
          <View style={[styles.itemName, styles.marginBottom9]}>
            <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
          </View>
          {/*<View style={{height: em(75),marginBottom: 12.5,}}>
            <Text style={styles.foodBrief} numberOfLines={_device == 'iPhone6' ? 4 : 5}>{item.brief}</Text>
          </View>*/}
          <View style={styles.foodCommonContainer}>
            <Text style={styles.foodCommon}>日期</Text>
            <Text style={styles.foodCommon}>{item.date}</Text>
          </View>
          <View style={styles.foodCommonContainer}>
            <Text style={styles.foodCommon}>餐廳</Text>
            <Text style={styles.foodCommon}>{item.canteenName}</Text>
          </View>
          <View style={styles.foodCommonContainer}>
            <Text style={styles.foodCommon}>堂食</Text>
            <Text style={[styles.foodCommon,item.originPrice?{textDecorationLine:'line-through',textDecorationColor:'#666'}:{}]}>{item.originPrice ? `HKD${parseFloat(item.originPrice).toFixed(2)}` : '市價'}</Text>
          </View>
          <View style={styles.foodCommonContainer}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.foodUnit}>HKD</Text>
              <Text style={styles.foodPrice}>{item.price}</Text>
            </View>
            <Text style={{color: '#ff5858',fontSize: _winWidth < 375 ? 13 : 16,marginTop:Platform.OS == 'android' ? -3:0}}>立即預訂</Text>
          </View>
        </View>
      </TouchableOpacity>
    )}

  _renderFlatListView() {
    _bottomDistance = isIphoneX() ?  bottomDistance + iPhoneXBottom : bottomDistance;
    const {placeSelected} = this.state;
    if(isEmpty(placeSelected)) {
      return null;
    }
    return (
      <CommonFlatList ref={c => this.flatlist = c} requestFunc={getNewArticleList} renderItem={(item,index) => this._renderFoodListItemView(item,index)} renderHeader={() => this._renderTopTitleView()} extraParams={{placeId: this.state.placeSelected.id}} getRawData={(data) => {this.setState({star: data.star})}} {...this.props}/>
    )
  }

  render() {
    return (
    <Container style={{position:'relative',backgroundColor: '#efefef',}}>
      {this._renderAdvertisementView()}
      {/*this._renderRefreshBgView()*/}
      {this._renderPlacePicker()}
      {this._renderHeaderView()}
      {this._renderWarningView()}
      {this._renderFlatListView()} 
    </Container>)
    }
  }

FoodListView.navigationOptions = ({screenProps}) => ({
  tabBarLabel: I18n[screenProps.language].weekMenu
})

export default FoodListView;

const styles = StyleSheet.create({
  articleItemContainer:{
    height: em(160),
    flex:1,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 15,
    marginRight: 15,
    borderRadius :5,
    flexDirection: 'row',
    shadowColor: '#333',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  articleItemDetails: {
    padding: 10,
    flex: 1,
    backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#ededeb',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    justifyContent: 'space-between'
  },
  itemName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodCommonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  foodName: {
    fontSize: em(18),
    color: '#111',
    fontWeight: '800'
  },
  foodCommon: {
    fontSize: em(13),
    color: '#666'
  },
  foodBrief: {
    fontSize: em(11),
    color: '#999',
    textAlign: 'justify',
    lineHeight: 16
  },
  foodUnit: {
    fontSize: em(14),
    color: '#666',
    marginRight: em(3),
    marginTop: Platform.OS === 'android' ? em(-3.5) : 0
  },
  foodPrice: {
    fontSize: _winWidth<375?em(16) : em(18),
    color: '#2a2a2a',
    lineHeight: em(18)
  },
  marginBottom9: {
    marginBottom: em(10),
  }
})
