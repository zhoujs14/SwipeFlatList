# ReactNative实现左滑删除列表

## 背景：
需求中要开发一个可以侧滑删除的列表，发现ReactNative并不未供这种组件。ReactNative本身其实封装了具有侧滑功能的FlatList在以下目录,但已经被弃用了，研究了一下没有搞懂
```java
./node_modules/react-native/Libraries/Experimental/SwipeableRow/SwipeableFlatList
```

之后尝试寻找一些第三方库,一个比较好用的是`react-native-swipe-list-view`,可以实现组件左右滑动、控制滑动的距离、删除动画以及预置的动画演示，符合要求的话建议用这个
[react-native-swipe-list-view  GitHub地址](https://github.com/jemise111/react-native-swipe-list-view)

![react-native-swipe-list-view演示](https://camo.githubusercontent.com/7c512e80fe0c234d4fc1f227c1acd1d6c6b047fbae7ee21d7581597213c3cc60/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f57726d72766d774d6e76766d7a4e335a70582f67697068792e676966)

但发现这种滑动实际上是两个组件,一个组件放在下面固定,上面的组件滑动,把下面隐藏的内容露出了,并且不能控制最大滑动的距离,只能禁用一侧的滑动,如果滑动超过了下面隐藏组件的范围,就会露出空白,虽然手势释放会回到设置的openValue,但这两点不符合UI的要求,只能开始研究自己实现.

## 实现效果
![侧滑删除列表演示](侧滑删除列表演示.gif)

## 代码
### SwipeRow
* 模仿react-native-swipe-list-view,实现一个可以滑动的SwipeRow，用[PanResponder手势处理](https://reactnative.cn/docs/panresponder)以及[Animated库](https://reactnative.cn/docs/animated)来实现滑动、删除的动画
* 实际上就是一个超过屏幕宽度的view,将隐藏元素放在屏幕外的部分,因为需求只用到左滑,实现的比较简单,利用view的高度绑定AnimatedValue,当删除行时就让view的高度变为0,达到视觉上的删除效果
* 行的高度和隐藏组件的宽带必须传入来实现动画，如果**行高或隐藏内容的宽度是不确定的，无法使用该组件**
* 如果点击隐藏内容后需要删除该行，可以通过ref调用delete功能，并在delete回调中移除列表中的数据，**若在动画前就删除数据，不会触发动画，因为列表重新渲染了**（可以在[Example](#示例)中看到示例）
### SwipeFlatList
* 封装SwipeRow到FlatList中，除了需要额外传入隐藏元素宽度和行高，可以像用`FlatList`一样使用该列表
* 通过`ref`管理列表中的行，当有行打开时滑动了其他行或者滑动了列表，打开的行会自动关闭
* 传入`getItemlayout`，虽然props中该项是可选参数，但不传入也许会导致错误，因为组件需行的宽高已知，`getItaemLayout`应该是很简单的，只需要按行数来计算就好了，在下面的[Example](#示例)中可以看到例子，同时通过getItemLayout，避免了`FlatList`动态测量组件，可以提升列表的性能
* 如果点击隐藏内容会需要进行处理，可以传入onHiddenAreaPress方法，该方法会返回该行的数据以及ref，通过item你可以知道点击行的数据是什么，通过ref你可以控制该行关闭/删除

### 示例
* 示范SwipeFlatList的使用方法

```javascript
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

```

## 后记
因为本人学习RN只有几个月，代码可能还有很多不完善的地方，仅供大家学习参考、拓展思路，希望对你有所帮助