import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CommonActions } from '@react-navigation/routers';
import { clearData } from '../../storage/db';
import allActions from '../../actions';
import { StyleSheet, View, Share, Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { primary } from '../../utilities/colors';
import { moderateScale } from 'react-native-size-matters';
import Icon from '../../ui/components/icon';
import Container from '../../ui/components/container';
const ListItem = (props) => {
    return (
        <TouchableOpacity
            onPress={() => {
                if (props.onPress) {
                    props.onPress();
                }
            }}>
            <View style={styles.listItem}>
                <View style={styles.centerView}>
                    <Icon
                        type={props.type}
                        name={props.icon}
                        size={moderateScale(20)}
                        style={[styles.image, { color: props.color }]}
                    />
                </View>

                <View style={styles.viewText}>
                    <Text style={styles.title}>{props.title}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};


class SideMenu extends Component {
    constructor(props) {
        super(props);
    }

    menuAction = (action) => {
        if (action === 'Share') {
            Share.share({
                message:
                    'Download PPB Application from https://play.google.com/store/apps/details?id=com.ppb_abb',
                title: 'Share PPB App',
            }).then((results) => { });
        } else if (action === 'LogOut') {
            this.logOut();
        } else {
            this.props.navigation.navigate(action);
        }
    };

    logOut = async () => {
        try {
            clearData().then(() => {
                this.props.logOut();
                const resetAction = CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Intro' }],
                });
                this.props.navigation.dispatch(resetAction);
            });
        } catch (e) { }
    };

    render() {
        return (
            <Container>
                <View style={styles.viewHeader}>
                    <Text style={styles.textTitle}>Pharmacy and Poisons Board</Text>
                    <Text>Commitment to Public Health.</Text>
                    <Text style={styles.textUser}>{this.props.user?.name}</Text>
                    <Text style={styles.textVersion}>v 1.0.1</Text>
                </View>

                {this.props.user && (
                    <>
                        <ListItem
                            type={'AntDesign'}
                            icon={'user'}
                            title={'Profile'}
                            color={primary}
                            onPress={() => {
                                this.menuAction('Profile');
                            }}
                        />

                        <ListItem
                            type={'AntDesign'}
                            icon={'key'}
                            title={'Change Password'}
                            color={primary}
                            onPress={() => {
                                this.menuAction('Password');
                            }}
                        />
                        <ListItem
                            type={'AntDesign'}
                            icon={'barschart'}
                            title={'Reports'}
                            color={primary}
                            onPress={() => {
                                this.menuAction('Reports');
                            }}
                        />
                        <ListItem
                            type={'Ionicons'}
                            icon={'md-notifications-outline'}
                            title={'Notifications'}
                            color={primary}
                            onPress={() => {
                                this.menuAction('Notification');
                            }}
                        />
                    </>
                )}
                <ListItem
                    type={'AntDesign'}
                    icon={'logout'}
                    title={this.props.user ? 'Log Out' : 'Home'}
                    color={primary}
                    onPress={() => {
                        this.menuAction('LogOut');
                    }}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    image: {
        marginHorizontal: moderateScale(10),
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: moderateScale(1),
        paddingVertical: moderateScale(20),
        borderColor: '#eee',
    },
    title: {
        fontSize: moderateScale(15),
        color: 'black',
    },
    centerView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewText: {
        alignItems: 'flex-start',
        flex: 1,
    },
    viewHeader: {
        backgroundColor: primary,
        paddingTop: moderateScale(50),
        paddingLeft: moderateScale(15),
    },
    textTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: moderateScale(20),
    },
    textUser: {
        fontWeight: 'bold',
        paddingVertical: moderateScale(15),
    },
    textVersion: {
        paddingBottom: moderateScale(5),
        paddingRight: moderateScale(10),
        fontSize: moderateScale(10),
        textAlign: 'right',
    },
});

const mapStateToProps = (state) => {
    return {
        user: state.currentUser?.user,
    };
};

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            logOut: allActions.userActions.logOut,
        },
        dispatch,
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(SideMenu);
