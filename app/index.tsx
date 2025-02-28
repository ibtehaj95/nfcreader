import { View, StyleSheet, StatusBar, StatusBarStyle } from "react-native";
import NFCTAGSLISTSTATIC from "@/assets/static-data/nfc-sample-data";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { List, IconButton, MD3DarkTheme } from 'react-native-paper';
import { LinearTransition } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { MMKV } from 'react-native-mmkv';
import { router } from 'expo-router';
import AddNFCModal from "@/components/AddNFCModal";

export default function Index() {

  const [ nfcTagsList, setNFCTagsList ] = useState<NFCTagsListType>([]);
  const [ visible, setVisible ] = useState<boolean>(false);
  const [ statusBarStyle ] = useState<StatusBarStyle>("dark-content");

  const storage = new MMKV();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    console.log(nfcTagsList);
  }, [nfcTagsList]);
  
  useEffect(() => {

    console.log(NFCTAGSLISTSTATIC);
    if (NFCTAGSLISTSTATIC.length > 0) {
      setNFCTagsList(NFCTAGSLISTSTATIC);
    }

    const keys = storage.getAllKeys();

    keys.forEach((key) => {
      const value = storage.getString(key);
      if (typeof(value) === 'string') {
        const nfcDataObj = JSON.parse(value);
        console.log(nfcDataObj);
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle={statusBarStyle}
      />
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={nfcTagsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <List.Item
              title={item.machine_name}
              titleStyle={styles.listItemDone}
              style={styles.listItemContainer}

              onPress={() => {
                console.log(`${item.machine_name} pressed with id ${item.id}`);
                // const findItemIndex = list.findIndex((listItem) => listItem.id === item.id);
                // const newItem = list[findItemIndex];
                // newItem.completed = !newItem.completed;
                // storage.set(`${item.id}`, JSON.stringify(newItem));
                // setListUpdated(true);
              }}

              onLongPress={() => {
                console.log(`${item.machine_name} long pressed with id ${item.id}`);
                // router.push({ pathname: "/todos/[id]", params: { id: item.id } });
              }}

              right={
                props => 
                  <IconButton {...props} 
                    icon="trash-can" 
                    iconColor={MD3DarkTheme.colors.onSurface}
                    size={25} 
                    onPress={() => {
                      console.log(`${item.machine_name} with id ${item.id} deleted`);
                      // storage.delete(`${item.id}`);
                      // setListUpdated(true);
                      // const newList = list.filter((listItem) => listItem.id !== item.id);
                      // setList(newList);
                    }}
                  />
              }
            />
          )}
          itemLayoutAnimation={LinearTransition}
        />
        </View>
        <View style={styles.addButtonContainer}>
          <IconButton
            icon="plus" 
            mode="contained"
            iconColor={MD3DarkTheme.colors.onSurface}
            containerColor={MD3DarkTheme.colors.outline}
            size={30} 
            onPress={() => {
              console.log(`Manually Add`);
              showModal();
              // storage.delete(`${item.id}`);
              // setListUpdated(true);
              // const newList = list.filter((listItem) => listItem.id !== item.id);
              // setList(newList);
            }}
          />
        </View>
        <AddNFCModal visible={visible} hideModal={hideModal} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: MD3DarkTheme.colors.surface,
    flex: 1,
  },
  listContainer: {
    flex: 1,
    marginVertical: 4,
  },
  listItemContainer:{
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
    marginVertical: 4,
    marginHorizontal: 12,
    borderRadius: 4,
  },
  listItemDone: {
    color: MD3DarkTheme.colors.onSurface,
  },
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
});