import React, { PureComponent } from 'react';
import {
  Animated,
  PanResponder,
  TouchableOpacity,
  ViewStyle,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { WINDOW_WIDTH } from '../util';

type Props = {
  rightContent?: JSX.Element; //右侧屏幕外组件
  rightContanierStyle?: ViewStyle;
  onRightPress?: () => void; //右侧组件点击事件,若要关闭/删除行,可通过ref调用closwRow/deleteRow方法
  rightContentWidth: number; //右侧组件宽度,即最大左滑距离
  lineHeight: number; //行高,用来设置删除行动画
  onTouchStart?: () => void; //当行响应触摸事件时触发,可用来处理其他SwipeRow
  directionalDistanceChangeThreshold?: number; //接管事件的横向滑动距离
  //setScrollEnabled: (isEnabled: boolean) => void;
};

type State = {};

export class SwipeRow extends PureComponent<Props, State> {
  lineHeigh: Animated.Value;

  directionalDistanceChangeThreshold: number;

  constructor(props: any) {
    super(props);

    this.rightContentWidth = this.props.rightContentWidth || 0;
    this.lineHeigh = new Animated.Value(this.props.lineHeight);
    this.directionalDistanceChangeThreshold =
      this.props.directionalDistanceChangeThreshold || 2;
  }

  closeRow = () => {
    this._startAnimated(0);
  };

  deleteRow = (callbackFn?: () => void) => {
    Animated.timing(this.lineHeigh, {
      toValue: 0,
      duration: 600,
      useNativeDriver: false,
    }).start(callbackFn);
  };

  // x偏移
  pan = new Animated.Value(0);

  rightContentWidth = 0;

  //滑动超过指定距离时接管事件
  _onMoveShouldSet = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const { dx } = gestureState;
    return Math.abs(dx) > this.directionalDistanceChangeThreshold;
  };

  //接管事件后触发函数
  _onPanResponderGrant = () => {
    this.props.onTouchStart && this.props.onTouchStart();
  };

  //滑动
  _onPanResponderMove = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState,
  ) => {
    const { dx, dy } = gestureState;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (
      absDx > this.directionalDistanceChangeThreshold ||
      absDy > this.directionalDistanceChangeThreshold
    ) {
      if (absDy > absDx) {
        return;
      } // moving vertically

      //左滑,直接关闭行
      if (dx > 0) {
        this._startAnimated(0);
      }
      //右滑,最大距离为隐藏内容宽度
      else {
        if (dx < -this.rightContentWidth) {
          this._startAnimated(-this.rightContentWidth);
        } else {
          this._startAnimated(dx);
        }
      }
    }
  };

  //手势释放
  _onPanResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState,) => {
    const { vx, dx } = gestureState;
    //最后有向左的趋势,直接打开.否则关闭
    if (vx < 0.2 && dx < 0) {
      this._startAnimated(-this.rightContentWidth);
    } else {
      this._startAnimated(0);
    }
  };

  //手势处理
  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: this._onMoveShouldSet,
    onPanResponderGrant: this._onPanResponderGrant,
    onPanResponderMove: this._onPanResponderMove,
    onPanResponderRelease: this._onPanResponderRelease,
  });

  /**
   * @description: 执行动画修改 pan 的值
   * @param {number} num
   */
  _startAnimated = (num: number) => {
    Animated.spring(this.pan, {
      toValue: num,
      useNativeDriver: false,
    }).start();
  };

  _onRightPress = () => {
    this.props.onRightPress && this.props.onRightPress();
  };

  render() {
    return (
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            width: WINDOW_WIDTH + this.rightContentWidth,
            height: this.lineHeigh,
            transform: [{ translateX: this.pan }],
          },
        ]}
        {...this.panResponder.panHandlers}>
        {this.props.children}
        <TouchableOpacity
          style={
            this.props.rightContanierStyle ? this.props.rightContanierStyle : {}
          }
          onPress={this._onRightPress}>
          {this.props.rightContent || null}
        </TouchableOpacity>
      </Animated.View>
    );
  }
}
