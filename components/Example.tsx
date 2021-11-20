import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { WINDOW_WIDTH } from '../util';
import { SwipeFlatList } from './SwipeFlatList';
import { SwipeRow } from './SwipeRow';

type Item = {
  id: number
  icon: string;
  text: string;
};

type State = {
  list: Item[];
};

export default class Example extends Component<{}, State> {
  //模拟列表数据
  constructor(props: {}) {
    super(props);
    const mockList = []
    for (let i = 0; i < 30; i++) {
      mockList.push(
        {
          id: i,
          icon: 'https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_rank.png',
          text: `我是第${i}行`,
        }
      )
    }
    this.state = {
      list: mockList
    };
  }

  //删除列表数据
  deleteDataFromList = (rowId: number) => {
    this.setState({
      list: this.state.list.filter(item => item.id !== rowId)
    })
  }

  onRowPress = () => {
    console.log('you pressed row');
  };

  onHiddenAreaPressed = (item: Item, clickRow: SwipeRow | undefined) => {
    console.log('you click hidden area of item:', item.id)
    clickRow?.deleteRow(() => this.deleteDataFromList(item.id)) //在删除动画回调中再删除数据，防止动画未结束就rerender
  }

  //滑动行可见部分
  _renderItem = (items: { item: Item; index: number }) => {
    const { item } = items;

    return (
      <TouchableOpacity
        style={{ width: WINDOW_WIDTH, height: 64, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, backgroundColor: 'white' }}
        onPress={this.onRowPress}
        activeOpacity={1}>
        <Image source={{ uri: item.icon }} style={{ width: 40, height: 40, marginRight: 8 }} />
        <Text style={{ lineHeight: 19, fontSize: 16, textAlign: 'center' }}>{item.text}</Text>
      </TouchableOpacity>
    );
  };

  //右侧隐藏部分
  _renderHiddenItem = () => {
    return (
      <View style={{ width: 72, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: 'red' }}>
        <Text style={{ color: "white", fontSize: 16, lineHeight: 19 }}>删除</Text>
      </View>
    );
  };

  keyExtractor = (item: Item, index: number) => {
    return item.text + index;
  };

  //不需要可以去掉
  _ListEmptyComponent = () => (
    <View style={{ flex: 1 }}>
      <Text>Empty List</Text>
    </View>
  );

  //不需要可以去掉
  _ListHeaderComponent = () => (
    <View style={{ width: WINDOW_WIDTH, justifyContent: "center", alignItems: 'center', backgroundColor: 'white', height: 40 }}>
      <Text style={{ color: 'orange', fontSize: 16, lineHeight: 19, fontWeight: "600" }}>Swipe FlatList</Text>
    </View>
  );

  //不需要可以去掉
  _ListFooterComponent = () => (
    <View style={{ width: WINDOW_WIDTH, justifyContent: 'center', alignItems: 'center', height: 32 }}>
      <Text>no more data</Text>
    </View>
  );

  _getItemLayout = (item: Item[] | null | undefined, index: number) => {
    return {
      length: 64,
      offset: 64 * index + 40, // ListHeaderComponent.height
      index,
    };
  };

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'gray' }}>
        <SwipeFlatList
          data={this.state.list}
          renderItem={this._renderItem}
          renderHiddenItem={this._renderHiddenItem}
          hiddenItemWidth={72}
          lineHeight={64}
          ListHeaderComponent={this._ListHeaderComponent()}
          ListFooterComponent={this._ListFooterComponent()}
          keyExtrator={this.keyExtractor}
          onHiddenAreaPress={this.onHiddenAreaPressed}
          onLayout={() => console.log("on layout")}
          getItemLayout={this._getItemLayout}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
