import React from 'react';
import {connect} from 'react-redux';
import {Alert} from 'react-native';
import {FlatList, StatusBar} from 'react-native';
import {List} from 'react-native-paper';

import Header from '../../ui/header';
import Container from '../../ui/components/container';
import {EmptyList} from '../../ui/components/empty_list';
import {withNetwork, get_call} from '../../services/network';

class Notification extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      nextpage: true,
      notifications: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  redirect(route, data) {
    this.props.navigation.navigate(route, {notification: data});
  }

  loadData = () => {
    withNetwork(() => {
      get_call(
        'notifications/index/page:' + this.state.page,
        this.props.authToken,
      )
        .then((response) => {
          this.setState(
            {
              loading: false,
              nextpage: response.data.paging.Notification.nextPage,
              notifications:
                this.state.page === 1
                  ? response.data.notifications
                  : [
                      ...this.state.notifications,
                      ...response.data.notifications,
                    ],
            },
            () => {
              if (
                this.state.page === 1 &&
                response.data.paging.Notification.nextPage
              ) {
                this.setState({page: 2}, () => {
                  this.loadData();
                });
              }
            },
          );
        })
        .catch((error) => {
          if (error.response.status !== 404) {
            this.setState({loading: false, notifications: []});
          }
          if (error.response.status === 401) {
            Alert.alert('Error', 'There was an error loading your data');
          }
        });
    });
  };

  formatMessage = (message) => {
    message = message.replace(/\\n/g, '');
    message = message.replace(/&nbsp;/g, ' ');
    return message.replace(/<[^>]*>?/gm, '').trim();
  };

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
        <Header title="Notifications" goBack={this.goBack} />

        <>
          <FlatList
            extraData={this.state}
            data={this.state.notifications}
            refreshing={this.state.loading}
            onEndReachedThreshold={0.85}
            onEndReached={() => {
              if (this.state.nextpage) {
                this.setState({page: this.state.page + 1}, () => {
                  this.loadData();
                });
              }
            }}
            scrollEventThrottle={300}
            bounces={false}
            onRefresh={() => {
              this.setState({page: 1}, () => {
                this.loadData();
              });
            }}
            ListEmptyComponent={() => {
              if (this.state.loading) {
                return null;
              } else {
                return (
                  <EmptyList
                    message={'Theres are no notifications at the moment.'}
                  />
                );
              }
            }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              return (
                <List.Item
                  title={item.Notification.title}
                  description={this.formatMessage(
                    item.Notification.system_message,
                  )}
                  right={(props) => <List.Icon {...props} icon="chat" />}
                  onPress={() => {
                    this.redirect('ViewMessage', item.Notification);
                  }}
                />
              );
            }}
          />
        </>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  authToken: state.currentUser.token,
});

export default connect(mapStateToProps)(Notification);
