// @flow

import * as React from 'react';
import { TripServices } from '@kiwicom/margarita-core';
import { View } from 'react-native';
import { StyleSheet } from '@kiwicom/universal-components';
import { type NavigationScreenProp } from 'react-navigation';

type NavigationParams = {||};

type Props = {|
  +navigation: NavigationScreenProp<NavigationParams>,
|};

export default function TripServicesScreen(props: Props) {
  return (
    <View style={styles.container}>
      <TripServices />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5', // There is no orbit token for this color
  },
});