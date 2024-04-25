import React from 'react';
import moment from 'moment';
import {BackHandler, Platform} from 'react-native';
import {StatusBar} from 'react-native';
import {List} from 'react-native-paper';

import Header from '../../ui/header';
import Container from '../../ui/components/container';

import {withNetwork} from '../../services/network';
import {
  aefi,
  pqmp,
  sadr,
  device,
  medication,
  transfusion,
} from '../../utilities/colors';

export default class Dashboard extends React.Component {
  componentDidMount() {
    this.loadData();
    if (Platform.OS === 'android') {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        this.handleBack,
      );
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.backHandler.remove();
    }
  }

  handleBack = () => {
    return true;
  };

  redirect(form) {
    this.props.navigation.navigate('Forms', {
      form_type: form,
      form_id: moment().format('YYYY-MM-DD HH:mm:ss'),
      form_data: [],
    });
  }

  showDrawer = () => {
    this.props.navigation.toggleDrawer();
  };

  loadData = () => {
    withNetwork(() => {
      //load specific data
    });
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Dashboard" onPress={this.showDrawer} />

        <>
          <List.Item
            style={{backgroundColor: aefi}}
            title="AEFI Reporting Form"
            description="Adverse Event Following Immunization"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('aefi')}
          />
          <List.Item
            style={{backgroundColor: pqmp}}
            title="PQHPT Reporting Form"
            description="Poor-Quality Health Products And Health Technologies"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('pqmp')}
          />
          <List.Item
            style={{backgroundColor: sadr}}
            title="SADR Reporting Form"
            description="Suspected Adverse Drug Reaction"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('sadr')}
          />
          <List.Item
            style={{backgroundColor: device}}
            title="Medical Devices Reporting Form"
            description="Medical Devices Incident"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('device')}
          />
          <List.Item
            style={{backgroundColor: medication}}
            title="Medication Error Reporting Form"
            description="Medical Error"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('medication')}
          />
          <List.Item
            style={{backgroundColor: transfusion}}
            title="Transfusion Reporting Form"
            description="Adverse Transfusion"
            left={(props) => <List.Icon {...props} icon="file" />}
            onPress={() => this.redirect('transfusion')}
          />
        </>
      </Container>
    );
  }
}
