import AboutScreen from "@/app/about";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
describe("<AboutScreen/>", () => {
  test("About screen renders correctly", () => {
    const component = render(
      <PaperProvider>
        <SafeAreaProvider>
          <AboutScreen />
        </SafeAreaProvider>
      </PaperProvider>,
    );
    expect(component).toBeTruthy();
  });
});
