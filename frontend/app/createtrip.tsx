import { useState } from "react";
import { Dropdown } from "react-native-paper-dropdown";
import { DatePickerModal } from "react-native-paper-dates";
import { View } from "react-native";
import { Button } from "react-native-paper";

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
        placeholder="Select Country"
        options={OPTIONS}
        value={country}
        onSelect={handleCountrySelect}
      ></Dropdown>
      <View style={{ justifyContent: "center", flex: 1, alignItems: "center" }}>
        <Button onPress={() => setOpen(true)} uppercase={false} mode="outlined">
          Pick range
        </Button>
        <DatePickerModal
          locale="en"
          mode="range"
          visible={open}
          onDismiss={onDismiss}
          startDate={range.startDate}
          endDate={range.endDate}
          onConfirm={onConfirm}
        />
      </View>
    </>
  );
}
