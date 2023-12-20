import React from 'react';
import {List} from 'react-native-paper';
import {moderateScale, moderateVerticalScale} from 'react-native-size-matters';
import {FlatList, StyleSheet, StatusBar, View, Text} from 'react-native';
import DropDown from 'react-native-paper-dropdown';

import Header from '../../ui/header';
import Container from '../../ui/components/component';

const forms = [
  {label: 'AEFI', value: 'aefis'},
  {label: 'SADR', value: 'sadrs'},
  {label: 'PQMP', value: 'pqmps'},
  {label: 'Medical Devices', value: 'devices'},
  {label: 'Medications', value: 'medication'},
  {label: 'Transfusions', value: 'transfusions'},
];

const reports = [
  {name: 'Age groups', icon: 'chart-arc', value: 'age'},
  {name: 'Gender', icon: 'chart-arc', value: 'gender'},
  {name: 'County', icon: 'chart-bar', value: 'county'},
  {name: 'Month', icon: 'chart-bar', value: 'month'},
  {name: 'Year', icon: 'chart-bar', value: 'year'},
];

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectForm: 'aefis',
      showForms: false,
      loading: true,
    };
  }

  handleBack = () => {
    return true;
  };

  openCloseMenu() {
    this.setState({showForms: !this.state.showForms});
  }

  goBack = () => {
    this.props.navigation.navigate('Dashboard');
  };

  redirect(route, report) {
    this.props.navigation.navigate(route, {
      form: this.state.selectForm,
      report: report,
    });
  }

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header title="Reports" goBack={this.goBack} />
        <View style={styles.viewContainer}>
          <Text style={styles.title}>Select the Form Type</Text>
          <DropDown
            label="Form"
            mode={'outlined'}
            visible={this.state.showForms}
            showDropDown={() => this.openCloseMenu()}
            onDismiss={() => this.openCloseMenu()}
            value={this.state.selectForm}
            setValue={(value) => this.setState({selectForm: value})}
            list={forms}
          />
          <Text style={styles.title}>Select the type of report</Text>

          <FlatList
            data={reports}
            scrollEventThrottle={300}
            bounces={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              return (
                <List.Item
                  style={styles.reports}
                  title={item.name}
                  left={(props) => <List.Icon {...props} icon={item.icon} />}
                  onPress={() => this.redirect('ViewReports', item.value)}
                />
              );
            }}
          />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    margin: moderateScale(15),
  },
  reports: {
    borderColor: 'grey',
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(0.5),
    marginVertical: moderateVerticalScale(5),
  },
  title: {
    marginVertical: moderateScale(15),
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});
