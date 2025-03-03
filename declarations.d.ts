type IDType = string;
type MachineNameType = string;
type ManualURLType = string;
type ServiceDateType = string;
type ServiceRecordIDType = number;

type NFCTagServiceRecordType = {
    id: ServiceRecordIDType;
    service_date: ServiceDateType;
};

type NFCTagDataType =  {
    id: IDType;
    machine_name: MachineNameType;
    manual_url: ManualURLType;
    service_record: NFCTagServiceRecordType[];
};

type NFCTagsListType = NFCTagData[];
