import React from 'react';
import {moderateScale} from 'react-native-size-matters';
import {StatusBar, StyleSheet, Platform, Text, View} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import Header from '../../ui/header';
import Icon from '../../ui/components/icon';
import {primary, accent} from '../../utilities/colors';

import User from './user';
import Institution from './institution';

const Tab = createMaterialTopTabNavigator();

export default class Register extends React.Component {
  render() {
    return (
      <>
        <StatusBar
          translucent={Platform.OS === 'ios'}
          hidden={false}
          backgroundColor={primary}
          showHideTransition={'slide'}
          barStyle={'light-content'}
        />
        <Header title="Registration" style={styles.headerStyle} />
        <Tab.Navigator
          tabBarPosition={'top'}
          initialRouteName={'User'}
          tabBarOptions={{
            scrollEnabled: false,
            showIcon: false,
            activeTintColor: accent,
            inactiveTintColor: 'white',
            labelStyle: {
              fontSize: moderateScale(14),
            },
            indicatorStyle: {backgroundColor: accent},
            style: {backgroundColor: primary},
          }}>
          <Tab.Screen
            name={'User'}
            component={User}
            options={{
              tabBarLabel: ({color}) => {
                return (
                  <View style={styles.centerRow}>
                    <Icon name={'user'} type={'FontAwesome5'} color={color} />
                    <Text
                      color={color}
                      style={[styles.textTabTitle, {color: color}]}>
                      User
                    </Text>
                  </View>
                );
              },
            }}
          />
          <Tab.Screen
            name={'Institution'}
            component={Institution}
            options={{
              tabBarLabel: ({color}) => {
                return (
                  <View style={styles.centerRow}>
                    <Icon
                      name={'building'}
                      type={'FontAwesome5'}
                      color={color}
                    />
                    <Text style={[styles.textTabTitle, {color: color}]}>
                      Institution
                    </Text>
                  </View>
                );
              },
            }}
          />
        </Tab.Navigator>
      </>
    );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  centerRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  textTabTitle: {
    color: 'white',
    marginLeft: 10,
  },
  center: {
    alignSelf: 'center',
  },
  headerStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
});
