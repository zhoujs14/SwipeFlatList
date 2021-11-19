import React, { Component } from 'react';
import { FlatList } from 'react-native';
import { SwipeRow } from './SwipeRow';
import { View } from 'react-native';
import { WINDOW_WIDTH } from '../util';
import { Text, StyleSheet } from 'react-native'


interface Props<T> {
  data: T[];
  renderItem: (items: { item: T; index: number }) => JSX.Element;
  renderHiddenItem: (items: { item: T; index: number }) => JSX.Element;
  hiddenItemWidth: number;
  ListFooterComponent?: JSX.Element | null;
  ListHeaderComponent?: JSX.Element | null;
  ListEmptyComponent?: JSX.Element | null;
  keyExtrator: (item: T, index: number) => string;
  onHiddenAreaPress: (item: T, clickRow: SwipeRow | undefined) => void;
  lineHeight: number;
  onLayout?: () => void;
  getItemLayout?: (
    data: Array<T> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
}

/**
 * 侧滑删除列表
 * @param renderItem 行元素,若包括点击事件,将有onPress的组件放在最外层
 * @param renderHiddenItem 隐藏元素,在renderItem的右侧
 * @param hiddenItemWidth 隐藏元素宽度,即该行最大可左滑的距离
 * @param onHiddenAreaPress 隐藏元素点击事件,将返回参数 item、clickrow 可通过clickRow调用SwipeRow的关闭、删除方法
 * @param lineHeight 行高,用于删除行动画
 */
export class SwipeFlatList<T> extends Component<Props<T>> {
  rowMap: Map<T, SwipeRow>;

  currentRow: SwipeRow | undefined;

  constructor(props: Props<T>) {
    super(props);

    this.rowMap = new Map();
    this.currentRow = undefined;
  }

  onGetRowRef = (item: T, ref: SwipeRow | null) => {
    if (!!ref) this.rowMap.set(item, ref);
  };

  _onRightPress = (item: T) => {
    const clickRow = this.rowMap.get(item);
    if (!!this.props.onHiddenAreaPress)
      this.props.onHiddenAreaPress(item, clickRow);
    else if (clickRow) clickRow.closeRow();
  };

  _onTouchStart = (item: T) => {
    const touchedRow = this.rowMap.get(item);
    if (!this.currentRow) this.currentRow = touchedRow;
    //当其他行接管触摸事件,关闭已打开的行
    else if (this.currentRow !== touchedRow) {
      this.currentRow.closeRow();
      this.currentRow = touchedRow;
    }
  };

  _renderItem = (items: { item: T; index: number }) => {
    const _rightContent = this.props.renderHiddenItem(items);
    const _renderItem = this.props.renderItem(items);
    const _key = 'r' + this.props.keyExtrator(items.item, items.index);
    const onGetRef = (ref: SwipeRow) => this.onGetRowRef(items.item, ref);
    const onRightPress = () => this._onRightPress(items.item);
    const onTouchStart = () => this._onTouchStart(items.item);

    return (
      <SwipeRow
        rightContent={_rightContent}
        rightContentWidth={this.props.hiddenItemWidth}
        key={_key}
        ref={onGetRef}
        onRightPress={onRightPress}
        lineHeight={this.props.lineHeight}
        onTouchStart={onTouchStart}>
        {_renderItem}
      </SwipeRow>
    );
  };

  onScroll = () => {
    this.currentRow && this.currentRow.closeRow();
  };

  render() {
    return (
      <View style={{ width: WINDOW_WIDTH }}>
        <FlatList
          data={this.props.data}
          renderItem={this._renderItem}
          keyExtractor={this.props.keyExtrator}
          ListHeaderComponent={this.props.ListHeaderComponent || null}
          ListFooterComponent={this.props.ListFooterComponent || null}
          ListEmptyComponent={this.props.ListEmptyComponent || null}
          onLayout={this.props.onLayout}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          onScroll={this.onScroll}
          getItemLayout={this.props.getItemLayout}
          directionalLockEnabled={true}
        />
      </View>
    );
  }
}
