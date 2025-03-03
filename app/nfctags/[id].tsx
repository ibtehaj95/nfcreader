import { View, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { MD3DarkTheme, Appbar, Avatar, Button, Card, Text, Title } from 'react-native-paper';
import { MMKV } from 'react-native-mmkv';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from 'expo-router';

const NFCDetails = () => {

  const [ nfcTagID, setNfcTagID ] = useState<IDType>("");
  const [ machineName, setMachineName ] = useState<MachineNameType>("");
  const [ machineManualURL, setMachineManualURL ] = useState<ManualURLType>("");
  const [ machineSericeRecord, setMachineSericeRecord ] = useState<NFCTagServiceRecordType[]>([{
    id: 0,
    service_date: "",
  }]);

  const storage = new MMKV();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    console.log("NFCDetails mounted", id);
    if(id){
      const savedNfcDetailsString = storage.getString(id.toString());
      if (typeof(savedNfcDetailsString) === 'string') {

        const savedNfcObj = JSON.parse(savedNfcDetailsString);
        console.log(savedNfcObj);
        
        if (typeof(savedNfcObj.id) === 'string' && typeof(savedNfcObj.machine_name) === 'string' && typeof(savedNfcObj.manual_url) === 'string') {
          
          setNfcTagID(savedNfcObj.id);
          setMachineName(savedNfcObj.machine_name);
          setMachineManualURL(savedNfcObj.manual_url);
          
          let localServiceRecord : NFCTagServiceRecordType[] = [];
          
          if (savedNfcObj.service_record.length > 0) {
            savedNfcObj.service_record.forEach((serviceRecord: NFCTagServiceRecordType) => {
              if(typeof(serviceRecord.service_date) === 'string' && typeof(serviceRecord.id) === 'number'){
                localServiceRecord.push(serviceRecord);
              }
              else{
                console.log("Invalid service record data");
              }
            });
          }
          setMachineSericeRecord(localServiceRecord);
        }
        else{
          console.log("Invalid data");
        }
      }
      else{
        console.log("Value not found");
      }
    }
  }, []);
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.background}>
        <Appbar.Header>
          <Appbar.BackAction 
            onPress={() => {
              router.replace('/'); 
            }
          } />
          <Appbar.Content title="NFC Tag Details" />
        </Appbar.Header>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tagID}>
              <Text variant="titleMedium" style= {styles.tagAttribute}>Tag ID</Text>
              <Text variant="titleMedium" style= {styles.tagValue}>{nfcTagID}</Text>
            </View>
            <View style={styles.machineName}>
              <Text variant="titleMedium" style= {styles.tagAttribute}>Machine Name</Text>
              <Text variant="titleMedium" style= {styles.tagValue}>{machineName}</Text>
            </View>
            <View style={styles.machineName}>
              <Text variant="titleMedium" style= {styles.tagAttribute}>Machine Manual URL</Text>
              <Text variant="titleMedium" style= {styles.tagValue}>{machineManualURL}</Text>
            </View>
            <View style={styles.serviceRecord}>
              <Text variant="titleMedium" style= {styles.tagAttribute}>Service Record</Text>
                <View style={styles.serviceRecordList}>
                <FlatList
                  data={machineSericeRecord}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => 
                    <View>
                      <Text variant="titleMedium" style= {styles.tagValue}>{item.service_date}</Text>
                    </View>
                  }
                />
                </View>
            </View>
          </Card.Content>
        </Card>
      </SafeAreaView>
    </SafeAreaProvider>
  )
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: MD3DarkTheme.colors.surface,
    flex: 1,
  },
  card: {
    margin: 20,
    backgroundColor: MD3DarkTheme.colors.surfaceVariant,
  },
  tagID: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  machineName: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  machineURL: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  serviceRecord: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  serviceRecordList: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tagAttribute: {
    color: MD3DarkTheme.colors.onSurfaceVariant,
  },
  tagValue: {
    color: MD3DarkTheme.colors.onSurface,
  },
});

export default NFCDetails;