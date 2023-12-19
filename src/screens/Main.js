import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
  
// import SideBar from 'PPB_App/src/screens/side_menu';
import Intro from './intro';
import allActions from '../actions';
import Login from './login';
import Register from './register';
// import Notification from 'PPB_App/src/screens/notifications';
// import ViewMessage from 'PPB_App/src/screens/notifications/view';
// import Dashboard from 'PPB_App/src/screens/dashboard';
// import Profile from 'PPB_App/src/screens/profile';
// import Password from 'PPB_App/src/screens/password';
// import Forms from 'PPB_App/src/screens/forms';
// import FormList from 'PPB_App/src/screens/forms';
// import FormAdd from 'PPB_App/src/screens/forms/add';
// import FormView from 'PPB_App/src/screens/forms/view';
// import FormEdit from 'PPB_App/src/screens/forms/followup';
// import FormPDF from 'PPB_App/src/screens/forms/view/pdf';
// import Reports from 'PPB_App/src/screens/reports';
// import ViewReports from 'PPB_App/src/screens/reports/view';

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
            // drawerPosition={'left'}
            // statusBarAnimation={'slide'}
            // drawerType={'slide'}
            // drawerContent={(p) => {
            //   return <SideBar {...p} />;
            // }}
            screenOptions={{headerShown: false}}>
            <Drawer.Screen
              name={'Intro'}
              component={Intro}
              options={{swipeEnabled: false}}
            />
            <Drawer.Screen
              name={'Register'}
              component={Register}
              options={{swipeEnabled: false}}
            />
            <Drawer.Screen
              name={'Login'}
              component={Login}
              options={{swipeEnabled: false}}
            />
            {/* <Drawer.Screen name={'Dashboard'} component={Dashboard} />
            <Drawer.Screen name={'Notification'} component={Notification} />
            <Drawer.Screen name={'ViewMessage'} component={ViewMessage} />
            <Drawer.Screen name={'Profile'} component={Profile} />
            <Drawer.Screen name={'Password'} component={Password} />
            <Drawer.Screen name={'Forms'} component={Forms} />
            <Drawer.Screen name={'FormList'} component={FormList} />
            <Drawer.Screen name={'FormAdd'} component={FormAdd} />
            <Drawer.Screen name={'FormEdit'} component={FormEdit} />
            <Drawer.Screen name={'FormView'} component={FormView} />
            <Drawer.Screen name={'Reports'} component={Reports} />
            <Drawer.Screen name={'ViewReports'} component={ViewReports} />
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
            /> */}
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
