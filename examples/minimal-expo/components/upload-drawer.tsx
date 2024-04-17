import { useRef } from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { openSettings } from "expo-linking";
import { useRouter } from "expo-router";
import { Camera, FileText, Image, Plus } from "lucide-react-native";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { trpc } from "~/utils/trpc";
import { useDocumentUploader, useImageUploader } from "~/utils/uploadthing";

export function UploadActionDrawer(props: { showTrigger: boolean }) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const utils = trpc.useUtils();
  const router = useRouter();

  const imageUploader = useImageUploader("videoAndImage", {
    onUploadProgress: (p) => {
      console.log("upload progress", p);
    },
    onClientUploadComplete: ([{ key, name }]) => {
      utils.getFiles.invalidate();
      bottomSheetModalRef.current?.dismiss();
      router.push(`/f/${key}?name=${name}`);
    },
  });
  const pdfUploader = useDocumentUploader("document", {
    onClientUploadComplete: ([{ key, name }]) => {
      utils.getFiles.invalidate();
      bottomSheetModalRef.current?.dismiss();
      router.push(`/f/${key}?name=${name}`);
    },
    onUploadProgress: (p) => {
      console.log("upload progress", p);
    },
  });

  const isUploading = imageUploader.isUploading || pdfUploader.isUploading;

  return (
    <BottomSheetModalProvider>
      {/* Trigger */}
      <Pressable
        className={[
          "absolute bottom-12 right-12 flex items-center justify-center rounded-full bg-blue-600 p-3 active:bg-blue-700",
          props.showTrigger ? "z-0 opacity-100" : "-z-50 opacity-0",
          "transition-opacity duration-300",
        ].join(" ")}
        onPress={() => bottomSheetModalRef.current?.present()}
      >
        <Plus color="white" size={36} />
      </Pressable>

      {/* Sheet Content */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: "#27272a" }}
      >
        <BottomSheetView className="flex items-center">
          {isUploading ? (
            <View className="flex h-full flex-col items-center gap-4 pt-8">
              <ActivityIndicator size="large" color="#ccc" />
              <Text className="font-bold text-white">Uploading...</Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => {
                  imageUploader.openImagePicker({
                    source: "library",
                    onInsufficientPermissions: () => {
                      Alert.alert(
                        "No Permissions",
                        "You need to grant permission to your Photos to use this",
                        [
                          {
                            text: "Dismiss",
                          },
                          {
                            text: "Open Settings",
                            onPress: () => openSettings(),
                            isPreferred: true,
                          },
                        ],
                      );
                    },
                  });
                }}
                className="flex w-full flex-row items-center gap-4 p-4 active:bg-zinc-900"
              >
                <Image size={24} color="white" style={{ marginLeft: 10 }} />
                <Text className="font-bold text-white">Select Image</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  imageUploader.openImagePicker({
                    source: "camera",
                    onInsufficientPermissions: () => {
                      Alert.alert(
                        "No Permissions",
                        "You need to grant camera permissions to use this",
                        [
                          {
                            text: "Dismiss",
                          },
                          {
                            text: "Open Settings",
                            onPress: () => openSettings(),
                            isPreferred: true,
                          },
                        ],
                      );
                    },
                  });
                }}
                className="flex w-full flex-row items-center gap-4 p-4 active:bg-zinc-900"
              >
                <Camera size={24} color="white" style={{ marginLeft: 10 }} />
                <Text className="font-bold text-white">Take Photo</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  pdfUploader.openDocumentPicker({
                    input: { foo: "bar" },
                  });
                }}
                className="flex w-full flex-row items-center gap-4 p-4 active:bg-zinc-900"
              >
                <FileText size={24} color="white" style={{ marginLeft: 10 }} />
                <Text className="font-bold text-white">Select PDF</Text>
              </Pressable>
              {/* Bottom "padding" */}
              <View className="h-10" />
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
