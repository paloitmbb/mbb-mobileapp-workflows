import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useSettings } from '../hooks/useSettings';
import { APP_NAME } from '../constants/appConstants';

const SettingsScreen = () => {
  const { notificationsEnabled, toggleNotifications } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{APP_NAME} Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Push Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          testID="notifications-switch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;
