import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SubjectMapScreen } from "./SubjectMapScreen";
import type { RootStackParamList } from "../../App";

export function SkillMapScreen(props: NativeStackScreenProps<RootStackParamList, "SkillMap">) {
  return <SubjectMapScreen navigation={props.navigation as never} />;
}
