import { useState } from "react";
import { DatePickerModal } from "react-native-paper-dates";
import { StyleSheet, View } from "react-native";
import { Button, FAB, Menu } from "react-native-paper";
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
      <Dropdown
        label="Country"
        mode={"outlined"}
        placeholder="Select Country"
        options={OPTIONS}
        value={country}
        onSelect={handleCountrySelect}
      ></Dropdown>
      <View style={{ justifyContent: "center", flex: 1, alignItems: "center" }}>
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
      </View>
      <View>
        <ActivityCard />
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
      </View>
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
