import { View, StyleSheet, StatusBar, StatusBarStyle } from "react-native";
import NFCTAGSLISTSTATIC from "@/assets/static-data/nfc-sample-data";
import { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { List, IconButton, MD3DarkTheme, Appbar, Button } from 'react-native-paper';
import { LinearTransition } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { MMKV } from 'react-native-mmkv';
import { router } from 'expo-router';
import AddNFCModal from "@/components/AddNFCModal";
import NFCTagScan from "@/components/NFCTagScan";

export default function Index() {

  const [ nfcTagsList, setNFCTagsList ] = useState<NFCTagsListType>([]);
  const [ addNFCManualModalVisible, setAddNFCManualModalVisible ] = useState<boolean>(false);
  const [ nfcTagsListUpdated, setNfcTagsListUpdated ] = useState<boolean>(false);
  const [ scanNFCModalVisible, setScanNFCModalVisible ] = useState<boolean>(false);
  const [ renderNFCScanComponent, setRenderNFCScanComponent ] = useState<boolean>(false);

  const [ statusBarStyle ] = useState<StatusBarStyle>("dark-content");

  const storage = new MMKV();

  const addNFCManualShowModal = () => setAddNFCManualModalVisible(true);
  const hideNFCManualShowModal = () => setAddNFCManualModalVisible(false);

  const scanNFCShowModal = () => setScanNFCModalVisible(true);
  const scanNFCHideModal = () => setScanNFCModalVisible(false);

  useEffect(() => {
    console.log(nfcTagsList);
  }, [nfcTagsList]);

  useEffect(() => {
    if (nfcTagsListUpdated === true) {
      console.log("List Updated");

      let nfcTagsLocalList: NFCTagsListType = [];

      // get all persisted keys
      const keys = storage.getAllKeys();

      // iterate over keys and append the value to the local variable
      keys.forEach((key) => {
        const value = storage.getString(key);
        if (typeof(value) === 'string') {
          const nfcDataObj = JSON.parse(value);
          // console.log(nfcDataObj);
          nfcTagsLocalList.push(nfcDataObj);
        }
      });

      // set the local variable to the state variable
      setNFCTagsList(nfcTagsLocalList);

      setNfcTagsListUpdated(false);
    }
  }, [nfcTagsListUpdated]);
  
  useEffect(() => {
    setNfcTagsListUpdated(true);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background}>
      <StatusBar
        barStyle={statusBarStyle}
      />
      <Appbar.Header>
          <Appbar.Content title="NFC Tags List" titleStyle={styles.appBar} />
      </Appbar.Header>
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
                router.push({ pathname: "/nfctags/[id]", params: { id: item.id } });
              }}

              right={
                props => 
                  <IconButton {...props} 
                    icon="trash-can" 
                    iconColor={MD3DarkTheme.colors.onSurface}
                    size={25} 
                    onPress={() => {
                      console.log(`${item.machine_name} with id ${item.id} deleted`);
                      storage.delete(`${item.id}`);
                      setNfcTagsListUpdated(true);
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
              addNFCManualShowModal();
            }}
          />
          <IconButton
            icon="nfc-search-variant" 
            mode="contained"
            iconColor={MD3DarkTheme.colors.onSurface}
            containerColor={MD3DarkTheme.colors.outline}
            size={30} 
            onPress={() => {
              console.log(`Scan NFC`);
              scanNFCShowModal();
              setRenderNFCScanComponent(true);
            }}
          />
        </View>
        <AddNFCModal visible={addNFCManualModalVisible} hideModal={hideNFCManualShowModal} homePageRefresh={setNfcTagsListUpdated} />
        {renderNFCScanComponent && <NFCTagScan visible={scanNFCModalVisible} hideModal={scanNFCHideModal} renderComponent={setRenderNFCScanComponent} homePageRefresh={setNfcTagsListUpdated} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBar: {
    textAlign: 'left',
  },
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