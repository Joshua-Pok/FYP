import { useState } from "react";
import { DatePickerModal } from "react-native-paper-dates";
import { StyleSheet, View, ScrollView } from "react-native";
import { Button, FAB, Menu, DataTable } from "react-native-paper";
import ActivityCard from "@/components/ActivityCard";
import { Dropdown } from "react-native-paper-dropdown";

export default function Createtrip() {
  const [country, setCountry] = useState<string | undefined>("");
  const [range, setRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [open, setOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);

  const openMenu = () => {
    setAddActivityModalOpen(true);
  };
  const onDismiss = () => {
    setOpen(false);
  };

  const onConfirm = ({
    startDate,
    endDate,
  }: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => {
    setOpen(false);
    setRange({ startDate, endDate });
  };

  const OPTIONS = [
    { label: "Singapore", value: "Singapore" },
    { label: "Malaysia", value: "Malaysia" },
    { label: "Hong Kong", value: "Hong Kong" },
  ];

  const handleCountrySelect = (value: string | undefined): void => {
    setCountry(value);
  };
  return (
    <>
      <h1>Trip Name</h1>
      <p>Trip Description</p>
      <Dropdown
        label="Country"
        mode={"outlined"}
        placeholder="Select Country"
        options={OPTIONS}
        value={country}
        onSelect={handleCountrySelect}
      ></Dropdown>
      <ScrollView contentContainerStyle={{ justifyContent: "center" }}>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
          Pick range
        </Button>
        <View style={{ height: 400, backgroundColor: "#ff321f" }}>
          <DatePickerModal
            locale="en"
            mode="range"
            visible={open}
            onDismiss={onDismiss}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
            {...({
              contentContainerStyle: { backgroundColor: "#ff321f" },
            } as any)}
          />
        </View>
        <ActivityCard />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Dessert</DataTable.Title>
            <DataTable.Title numeric>Calories</DataTable.Title>
            <DataTable.Title numeric>Fat</DataTable.Title>
          </DataTable.Header>

          <DataTable.Row>
            <DataTable.Cell>Frozen yogurt</DataTable.Cell>
            <DataTable.Cell numeric>159</DataTable.Cell>
            <DataTable.Cell numeric>6.0</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>Ice cream sandwich</DataTable.Cell>
            <DataTable.Cell numeric>237</DataTable.Cell>
            <DataTable.Cell numeric>8.0</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Pagination
            page={1}
            numberOfPages={3}
            onPageChange={(page) => {
              console.log(page);
            }}
            label="1-2 of 6"
          />
        </DataTable>
        <View style={{ flex: 1 }}>
          <Menu
            visible={addActivityModalOpen}
            anchor={
              <FAB style={styles.addactivity} onPress={openMenu} icon="plus" />
            }
          >
            <Menu.Item leadingIcon="redo" title="redo"></Menu.Item>
          </Menu>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  addactivity: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: "50%",
  },
});
