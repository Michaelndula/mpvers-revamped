import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import SideBar from './side_menu';
import Intro from './intro';
import allActions from '../actions';
import Login from './login';
import Register from './register';
import Dashboard from './dashboard';
import Notification from './notifications';
import ViewMessage from './notifications/view';
import Profile from './profile';
import Password from './password';
import FormAdd from './forms/add'; 
import FormList from './forms'; 
import Forms from './forms'; 
import FormView from './forms/view';
import FormEdit from './forms/followup';
import FormPDF from './forms/view/pdf';
import Reports from './reports';
import ViewReports from './reports/view';

const Drawer = createDrawerNavigator();

class App extends Component {
  componentDidMount() {
    if (this.props.user) {
      this.props.setToken(this.props.token);
      this.props.setUser(this.props.user);
    }
  }

  render() {
    return (
      <>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName={this.props.user !== null ? 'Dashboard' : 'Intro'}
            drawerPosition={'left'}
            statusBarAnimation={'slide'}
            drawerType={'slide'}
            drawerContent={(p) => {
              return <SideBar {...p} />;
            }}
            screenOptions={{ headerShown: false }}>
            <Drawer.Screen
              name={'Intro'}
              component={Intro}
              options={{ swipeEnabled: false }}
            />
            <Drawer.Screen
              name={'Register'}
              component={Register}
              options={{ swipeEnabled: false }}
            />
            <Drawer.Screen
              name={'Login'}
              component={Login}
              options={{ swipeEnabled: false }}
            />
            <Drawer.Screen name={'Dashboard'} component={Dashboard} />
            <Drawer.Screen name={'Notification'} component={Notification} />
            <Drawer.Screen name={'ViewMessage'} component={ViewMessage} />
            <Drawer.Screen name={'Profile'} component={Profile} />
            <Drawer.Screen name={'Password'} component={Password} />
            <Drawer.Screen name={'Reports'} component={Reports} />
            <Drawer.Screen name={'ViewReports'} component={ViewReports} />
            <Drawer.Screen name={'FormAdd'} component={FormAdd} />
            <Drawer.Screen name={'Forms'} component={Forms} />
            <Drawer.Screen name={'FormList'} component={FormList} />
            <Drawer.Screen name={'FormEdit'} component={FormEdit} />
            <Drawer.Screen name={'FormView'} component={FormView} />

            <Drawer.Screen
              name={'FormPDF'}
              component={FormPDF}
              options={{
                title: 'Form PDF',
                headerStyle: {
                  backgroundColor: '#f4511e',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setToken: allActions.userActions.setToken,
      setUser: allActions.userActions.setUser,
    },
    dispatch,
  );
}

export default connect(null, mapDispatchToProps)(App);
