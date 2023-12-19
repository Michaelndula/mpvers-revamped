import React from 'react';
import {View} from 'react-native';

const Container = (props) => {
  return (
    <View
      style={[
        // eslint-disable-next-line react-native/no-inline-styles
        props.style ? props.style : {backgroundColor: 'white'},
        // eslint-disable-next-line react-native/no-inline-styles
        {flex: 1},
      ]}>
      {props.children}
    </View>
  );
};

export default Container;
