import React from "react";
import {
  View,
  Image,
  Platform,
  TouchableOpacity
} from "react-native";
import { Container, Content, Icon } from "native-base";
import LinearGradient from 'react-native-linear-gradient';
//navigation
import {
  StackNavigator,
  TabNavigator,
  DrawerNavigator,
  NavigationActions,
  DrawerItems
} from "react-navigation";
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
//views
import CustomLoginView from './CustomLoginView';
import SettingView from "./SettingView";

import FoodDetailsView from "./views/FoodDetailsView";
import FoodListView from "./views/FoodListView";
import ContentView from "./views/ContentView";
import MyOrderView from "./views/MyOrderView";
import StatementView from "./views/StatementView";
import MandatoryUpdateView from "./MandatoryUpdateView";
import ConfirmOrderView from "./views/ConfirmOrderView";
import UserHelperView from "./views/UserHelperView";
import PaySettingView from "./views/PaySettingView";
import CreditCardView from "./views/CreditCardView";
import ManageCreditCardView from './views/ManageCreditCardView';
import MoreDetailView from './views/MoreDetailView';
import FeedbackView from './views/FeedbackView';
import UserInfoView from './views/UserInfoView';
import CouponView from './views/CouponView';
//api
import source from "./api/CancelToken";
//utils
import GLOBAL_PARAMS, { em } from "./utils/global_params";
//store
import store from "./store";
//components
import CommonHOC from "./hoc/CommonHOC";
import TabBar from "./components/Tabbar";
import BottomIntroduce from "./components/BottomIntroduce";
import Text from "./components/UnScalingText";
//styles
import MainViewStyles from './styles/mainview.style';
//language
import i18n from './language/i18n';
import mainviewStyle from "./styles/mainview.style";

const tabView = TabNavigator(
  {
    ShopTab: {
      screen: FoodDetailsView,
      navigationOptions: {
        // tabBarLabel: '每日推薦',
        // drawerLockMode: Platform.OS=='ios'?'unlocked':'locked-closed', // 修复安卓侧滑问题
        tabBarIcon: ({ focused }) => {
          return focused ? (
            <Image
              style={MainViewStyles.tabBarImage}
              resizeMode="stretch"
              source={require('./asset/Shape.png')}
            />
        ): (<Image
          style={MainViewStyles.tabBarImage}
          resizeMode="stretch"
          source={require('./asset/Shape_inactive.png')}
        />)}
      }
    },
    FoodListTab: {
      screen: FoodListView,
      navigationOptions: {
        // tabBarLabel: "本週菜單",
        drawerLockMode: Platform.OS=='ios'?'unlocked':'locked-closed',
        tabBarIcon: ({ focused }) => {
          return focused ? (
          <Image
            style={MainViewStyles.tabBarImage}
            resizeMode="stretch"
            source={require('./asset/date_active.png')}
          />
        ): (<Image
          style={MainViewStyles.tabBarImage}
          resizeMode="stretch"
          source={require('./asset/date.png')}
        />)}
      }
    }
  },
  {
    // tabBarComponent: TabBar,
    animationEnabled: false,
    swipeEnabled: false,
    tabBarPosition: "bottom",
    lazyLoad: false, //该属性只会加载tab的当前view
    tabBarComponent: TabBar,
    backBehavior:"none",
    removeClippedSubviews: false,
    tabBarOptions: {
      showLabel: true,
      showIcon: true
    }
  }
);

const WHITE_LIST = ['FoodDetails', 'UserHelpDrawer', 'SettingDrawer'];

const CustomDarwerItem = ({leftImage,title}) => (
  <View
      style={MainViewStyles.drawerItemBtn}
    >
      <Image
        source={leftImage}
        style={MainViewStyles.drawerItemImage}
        resizeMode="contain"
      />
      <Text
        style={MainViewStyles.drawerItemText}
      >
        {title}
      </Text>
    </View>
);

const customItemPress = ({route, focused}, navigation) => {
  // console.log(route);
  // console.log(navigation);
  let _toPage = (route, focused, navigation) => {
    navigation.navigate('DrawerClose');
    if (!focused) {
      let subAction;
      if (route.index !== undefined && route.index !== 0) {
        subAction = NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: route.routes[0].routeName,
            }),
          ],
        });
      }
      navigation.navigate(route.routeName, undefined, subAction);
    }
  };
  if(store.getState().auth.username == null &&  WHITE_LIST.indexOf(route.routeName) == -1) {
    navigation.navigate('Login', {page: route.routeName,callback: () => _toPage(route, focused, navigation)}); // 登录验证
    return;
  }
  _toPage(route, focused, navigation);
}

const darwerView = DrawerNavigator(
  {
    FoodDetails: {
      screen: CommonHOC(FoodListView),
    },
    MyOrderDrawer: {
      screen: CommonHOC(MyOrderView)
    },
    PayTypeDrawer: {
      screen: CommonHOC(PaySettingView)
    },
    CouponDrawer: {
      screen: CommonHOC(CouponView)
    },
    UserHelpDrawer: {
      screen: CommonHOC(UserHelperView)
    },
    SettingDrawer: {
      screen: CommonHOC(SettingView)
    },
    UserInfoDrawer: {
      screen: CommonHOC(UserInfoView)
    }
  },
  {
    initialRouteName: 'FoodDetails',
    drawerWidth: GLOBAL_PARAMS._winWidth * 0.75,
    drawerPosition: "left",
    contentComponent: props => {
      let {language} = props.screenProps;
      let _drawItemArr = [
        {title: i18n[language].dailyFood, leftImage: require("./asset/food.png")},
        {title: i18n[language].myorder,leftImage: require("./asset/order.png"),},
        {title: i18n[language].payment,leftImage: require('./asset/payment.png'),},
        {title: i18n[language].ticket,leftImage: require('./asset/coupon.png'),},
        {title: i18n[language].contact, leftImage: require("./asset/help.png"),},
        {title: i18n[language].setting, leftImage: require('./asset/setting.png'),},
        {title: i18n[language].setting, leftImage: require('./asset/setting.png'),},
      ];
      let customLoginBtnRoute = {
        route: {key:"UserInfoDrawer",routeName:"UserInfoDrawer",params: undefined},
        focused: false
      };
      let _alreadyLogin = props.screenProps.user != null;
      const {userInfo:{username, nickName, profileImg}} = props.screenProps;
      return (
        <Container>
          <View>
            <LinearGradient colors={['#FF7F0B','#FF1A1A']} start={{x:0.0, y:0.0}} end={{x:1.0,y: 0.0}} style={MainViewStyles.drawerTopContainer}>
              <Image source={_alreadyLogin && profileImg != '' ? {uri: profileImg}: require('./asset/notlogged.png')} style={MainViewStyles.drawerTopImage}/>
              <TouchableOpacity onPress={() => customItemPress(customLoginBtnRoute, props.navigation) } style={MainViewStyles.drawerTopImageContainer}>
                <View style={{height:em(70),justifyContent:'space-around'}}>
                  <Text style={MainViewStyles.topName}>{_alreadyLogin ? nickName:'日日有得食'}</Text>
                  {_alreadyLogin ? <Text style={mainviewStyle.topNickName}>{username}</Text> : <Text style={mainviewStyle.topNickName}>立即登錄</Text>}
                </View>
                <Text style={MainViewStyles.loginBtnText}>{_alreadyLogin?'去更改':''} <Icon name="ios-arrow-forward-outline" style={mainviewStyle.loginBtnArrow}/></Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <Content style={MainViewStyles.drawerContent}>
            <View style={MainViewStyles.drawerInnerContent}>
            <DrawerItems {...props} 
            onItemPress={({route, focused}) => customItemPress({route, focused},props.navigation)}
            getLabel = {(scene) => {
              if(scene.route.routeName == "UserInfoDrawer") {return null}
              return (
                <CustomDarwerItem {..._drawItemArr[scene.index]}/>
              )
            }}/>
            </View>
            </Content>
            <BottomIntroduce {...props}/>
        </Container>
      );
    }
  },
);

let MainView = StackNavigator(
  {
    // Splash: {
    //   screen: SplashPageView
    // },
    Home: {
      screen: darwerView,
    },
    Food: {
      screen: CommonHOC(FoodDetailsView)
    },
    Mandatory: {
      screen: MandatoryUpdateView
    },
    Content: {
      screen: CommonHOC(ContentView),
      navigationOptions: {
        tabBarVisible: false
      }
    },
    Login: {
      screen: CustomLoginView,
      navigationOptions: {
        tabBarVisible: false,
        transitionConfig: {
          isModal: true
        }
      }
    },
    Statement: {
      screen: CommonHOC(StatementView)
    },
    Order: {
      screen: CommonHOC(ConfirmOrderView)
    },
    PayType: {
      screen: CommonHOC(PaySettingView)
    },
    Coupon: {
      screen: CommonHOC(CouponView)
    },
    Credit: {
      screen: CommonHOC(CreditCardView)
    },
    Manage_Card: {
      screen: CommonHOC(ManageCreditCardView)
    },
    MoreDetail: {
      screen: CommonHOC(MoreDetailView)
    },
    Feedback: {
      screen: CommonHOC(FeedbackView)
    },
  },
  { headerMode: "none",
    cardStyle: {
      backgroundColor: '#fff',
    },
    transitionConfig: (): Object => ({
      containerStyle: {
        backgroundColor: '#fff',
      },
      screenInterpolator: sceneProps => {
        return CardStackStyleInterpolator.forHorizontal(sceneProps);
      }
    }),
  }
);

// 自定义路由拦截
const defaultGetStateForAction = MainView.router.getStateForAction;

// 拦截路由主方法
MainView.router.getStateForAction = (action, state) => {
  // console.log('action', action)
  // console.log('state', state)
  if (action.type === NavigationActions.NAVIGATE) {
    source.cancel();
  }
  if (
    typeof state !== "undefined" &&
    state.routes[state.routes.length - 1].routeName === "Search"
  ) {
    const routes = state.routes.slice(0, state.routes.length - 1);
    return defaultGetStateForAction(action, {
      ...state,
      routes,
      index: routes.length - 1
    });
  }
  // if(action.type != 'Navigation/SET_PARAMS') {
  //   if(action.routeName == 'DrawerClose' || action.routeName == 'ShopTab') { //监听首页
  //     store.dispatch({type:'REFRESH',refresh: new Date()});
  //   }
  // }

  if (state && action.type === NavigationActions.NAVIGATE) {
    if (action.params && action.params.replaceRoute) {
      //replaceRoute值 仅仅作为一个标识，进到这个方法之后就没有作用了
      delete action.params.replaceRoute;
      if (state.routes.length > 1 && state.index > 0) {
        let _routeIndex = typeof action.params.index == 'undefined' ? state.routes.length - 2 : action.params.index;
        let routes = null;
        if(_routeIndex == 0) {
          routes= [state.routes[0]];
        } else {
          routes = state.routes.slice(0, state.routes.length - 1);
        }
      // routes.push(action)
          return defaultGetStateForAction(action, {
            ...state,
            routes,
            index: _routeIndex
          });
      }
    }
  }

  // 避免重复跳转
  if(state && action.type == NavigationActions.NAVIGATE && action.routeName == state.routes[state.routes.length - 1].routeName){
    return null
  }
  return defaultGetStateForAction(action, state);
};

export default MainView;
