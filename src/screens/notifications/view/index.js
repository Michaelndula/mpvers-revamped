import React from 'react';
import { connect } from 'react-redux';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { accent, green } from '../../../utilities/colors';
import { moderateScale } from 'react-native-size-matters';
import { Alert, ScrollView, Text, StatusBar, StyleSheet } from 'react-native';

import Header from '../../../ui/header';
import Container from '../../../ui/components/container';

import { withNetwork, post_call } from '../../../services/network';
import { capitalizeFirstLetter } from '../../../utilities/validation';

const theme = {
    colors: { primary: accent, underlineColor: 'transparent' },
};

class ViewMessage extends React.Component {
    constructor(props) {
        super(props);
        const { notification } = this.props.route.params;

        this.state = {
            notification: notification,
            subject: null,
            content: null,
            message: '',
            loading: false,
            showSnack: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            subject: null,
            content: null,
            message: '',
            loading: false,
            notification: nextProps.route.params.notification,
        });
    }

    redirect(route, data) {
        this.props.navigation.navigate(route, { notification: data });
    }

    submitComment = () => {
        withNetwork(() => {
            if (!this.state.content) {
                this.setState({ message: 'Message is required', showSnack: true });
                return;
            }
            let comment = {
                Comment: {
                    model_id: this.state.notification.id,
                    foreign_key: this.state.notification.foreign_key,
                    model: this.state.notification.model,
                    category: 'external',
                    subject: 'Response : ' + this.state.notification.title,
                    content: this.state.content,
                },
            };
            post_call('comments/report_feedback', this.props.authToken, comment)
                .then((response) => {
                    Alert.alert(
                        capitalizeFirstLetter(response.data.status),
                        response.data.message,
                    );
                    if (response.data.status === 'success') {
                        this.setState({ content: null });
                    }
                })
                .catch((error) => {
                    if (error.response.status !== 404) {
                        this.setState({ loading: false, notifications: [] });
                    }
                    if (error.response.status === 401) {
                        Alert.alert('Error', 'There was an error loading your data');
                    }
                });
        });
    };

    formatMessage = (text) => {
        text = text.replace(/\\n/g, '\n');
        text = text.replace(/&nbsp;/g, ' ');
        return text.replace(/<[^>]*>?/gm, '').trim();
    };

    closeSnackBar = () => {
        this.setState({ showSnack: !this.state.showSnack });
    };

    goBack = () => {
        this.props.navigation.navigate('Notification');
    };

    render() {
        return (
            <Container>
                <StatusBar
                    translucent
                    barStyle={'dark-content'}
                    backgroundColor={'transparent'}
                />

                <Header title="View Notification" goBack={this.goBack} />

                <ScrollView style={styles.viewContainer}>
                    <Text style={styles.title}>{this.state.notification.title}</Text>
                    <Text style={styles.content}>
                        {this.formatMessage(this.state.notification.system_message)}
                    </Text>

                    <TextInput
                        mode="outlined"
                        label="Message"
                        theme={theme}
                        placeholder="Type something"
                        value={this.state.content}
                        multiline={true}
                        numberOfLines={5}
                        blurOnSubmit={true}
                        onChangeText={(text) => {
                            this.setState({ content: text });
                        }}
                    />

                    <Button
                        mode="contained"
                        style={styles.button}
                        loading={this.state.loading}
                        onPress={() => {
                            this.submitComment();
                        }}>
                        <Text style={styles.textButton}>Submit</Text>
                    </Button>
                </ScrollView>
                <Snackbar
                    duration={5000}
                    visible={this.state.showSnack}
                    onDismiss={this.closeSnackBar}
                    action={{
                        label: 'OK',
                    }}>
                    {this.state.message}
                </Snackbar>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    viewContainer: {
        margin: moderateScale(15),
    },
    content: {
        marginVertical: moderateScale(15),
        color: accent
    },
    textButton: {
        color: 'white',
    },
    title: {
        marginBottom: moderateScale(10),
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: accent
    },
    button: {
        alignSelf: 'center',
        backgroundColor: green,
        width: moderateScale(125),
        height: moderateScale(50),
        justifyContent: 'center',
        marginTop: moderateScale(15),
    },
});

const mapStateToProps = (state) => ({
    authToken: state.currentUser.token,
});

export default connect(mapStateToProps)(ViewMessage);
