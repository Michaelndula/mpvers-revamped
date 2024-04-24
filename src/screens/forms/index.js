import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {StatusBar, StyleSheet, FlatList, Alert} from 'react-native';
import {List, FAB} from 'react-native-paper';
import {moderateScale} from 'react-native-size-matters';

import Header from '../../ui/header';
import Container from '../../ui/components/container';
import {EmptyList} from '../../ui/components/empty_list';
import {withNetwork, get_call} from '../../services/network';

import {fetchLocalStorage} from '../../storage/db';
import {capitalizeFirstLetter} from '../../utilities/validation';

class FormList extends React.Component {
  constructor(props) {
    super(props);
    const {form_type} = this.props.route.params;

    this.state = {
      page: 1,
      nextpage: true,
      formType: form_type,
      forms: [],
      unsubmittedForms: [],
      loading: true,
      isInternetReachable: true,
    };
  }

  componentDidMount() {
    this.loadForms();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(
      {
        page: 1,
        forms: [],
        unsubmittedForms: [],
        loading: true,
        nextpage: true,
        isInternetReachable: true,
        formType: nextProps.route.params.form_type,
      },
      () => {
        this.loadForms();
      },
    );
  }

  loadForms = () => {
    fetchLocalStorage(this.state.formType + '_forms').then((all_forms) => {
      this.setState({unsubmittedForms: all_forms});
    });
    if (this.props.user) {
      withNetwork(
        () => {
          let formCapital = capitalizeFirstLetter(this.state.formType);
          let form_type = this.state.formType + 's';
          let url = form_type + '/index/page:' + this.state.page;

          get_call(url, this.props.authToken)
            .then((response) => {
              let formData = response.data[form_type].filter(
                (item, i) =>
                  item[capitalizeFirstLetter(this.state.formType)]
                    ?.submitted === '2',
              );

              //response.data[form_type]

              this.setState(
                {
                  loading: false,
                  nextpage: response.data.paging[formCapital].nextPage,
                  forms:
                    this.state.page === 1
                      ? response.data[form_type]
                      : [...this.state.forms, ...formData],
                },
                () => {
                  if (
                    this.state.page === 1 &&
                    response.data.paging[formCapital].nextPage
                  ) {
                    this.setState({page: 2}, () => {
                      this.loadForms();
                    });
                  }
                },
              );
            })
            .catch((error) => {
              if (error.response.status !== 404) {
                this.setState({loading: false, forms: []});
              }
              if (error.response.status === 401) {
                Alert.alert('Error', 'There was an error loading your data');
              }
            });
        },
        () => {
          this.setState({
            isInternetReachable: false,
            loading: false,
            forms: [],
          });
        },
      );
    } else {
      this.setState({loading: false});
    }
  };

  payloadData = (item) => {
    return {
      form_type: this.state.formType,
      answers: item,
    };
  };

  redirect(route, data) {
    this.props.navigation.navigate(route, data);
  }

  goBack = () => {
    this.props.navigation.navigate('Dashboard');
  };

  render() {
    return (
      <Container>
        <StatusBar
          translucent
          barStyle={'dark-content'}
          backgroundColor={'transparent'}
        />
        <Header
          title={`${this.state.formType.toUpperCase()} Reporting Forms`}
          goBack={this.goBack}
        />
        <>
          {this.state.unsubmittedForms &&
            this.state.unsubmittedForms.map((single_form, index) => {
              if (
                single_form?.user_id === this.props.user?.id ||
                single_form?.user_id === null
              ) {
                return (
                  <List.Item
                    key={index}
                    title={single_form.form_id}
                    description={single_form.report_type + ' (unsubmitted)'}
                    left={(props) => <List.Icon {...props} icon="file" />}
                    onPress={() => {
                      if (single_form.report_type === 'followup') {
                        this.redirect('FormEdit', {
                          form_type: this.state.formType,
                          form_id: single_form.form_id,
                          form_data: single_form.data,
                          form_complete: single_form.complete_form,
                        });
                      } else {
                        this.redirect('FormAdd', {
                          form_type: this.state.formType,
                          form_id: single_form.form_id,
                          form_data: single_form.data,
                        });
                      }
                    }}
                    style={styles.listView}
                  />
                );
              }
            })}

          <FlatList
            extraData={this.state}
            data={this.state.forms}
            refreshing={this.state.loading}
            onEndReachedThreshold={0.85}
            onEndReached={() => {
              if (this.state.nextpage) {
                this.setState({page: this.state.page + 1}, () => {
                  this.loadForms();
                });
              }
            }}
            scrollEventThrottle={300}
            bounces={false}
            onRefresh={() => {
              this.setState({page: 1}, () => {
                this.loadForms();
              });
            }}
            ListEmptyComponent={() => {
              if (
                this.state.loading ||
                (this.state.unsubmittedForms &&
                  this.state.unsubmittedForms.length > 0)
              ) {
                return null;
              } else {
                return (
                  <EmptyList message={'Theres are no forms at the moment.'} />
                );
              }
            }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              if (
                item[capitalizeFirstLetter(this.state.formType)].submitted ===
                '2'
              ) {
                return (
                  <List.Item
                    title={
                      item[capitalizeFirstLetter(this.state.formType)]
                        .reference_no
                    }
                    description={
                      item[capitalizeFirstLetter(this.state.formType)]
                        .report_type
                    }
                    left={(props) => <List.Icon {...props} icon="file" />}
                    onPress={() => {
                      this.redirect('FormView', this.payloadData(item));
                    }}
                    style={styles.listView}
                  />
                );
              }
            }}
          />

          <FAB
            style={styles.fab}
            icon="plus"
            onPress={() =>
              this.redirect('FormAdd', {
                form_type: this.state.formType,
                form_id: moment().format('YYYY-MM-DD HH:mm:ss'),
                form_data: [],
              })
            }
          />
        </>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  authToken: state.currentUser.token,
  user: state.currentUser.user,
});

export default connect(mapStateToProps)(FormList);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  listView: {
    borderColor: 'grey',
    borderBottomWidth: moderateScale(0.5),
  },
});
