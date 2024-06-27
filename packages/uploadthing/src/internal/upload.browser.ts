import * as Micro from "effect/Micro";

import type { FetchContext } from "@uploadthing/shared";
import { UploadThingError } from "@uploadthing/shared";

import type { NewPresignedUrl } from "../types";

export const uploadWithProgress = (
  file: File,
  rangeStart: number,
  presigned: NewPresignedUrl,
  onUploadProgress?:
    | ((opts: { loaded: number; delta: number }) => void)
    | undefined,
) =>
  Micro.async<unknown, UploadThingError, FetchContext>((resume) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presigned.url, true);
    xhr.setRequestHeader("Range", `bytes=${rangeStart}-`);
    xhr.responseType = "json";

    let previousLoaded = 0;
    xhr.upload.addEventListener("progress", ({ loaded }) => {
      const delta = loaded - previousLoaded;
      onUploadProgress?.({ loaded, delta });
      previousLoaded = loaded;
    });
    xhr.addEventListener("load", () => {
      resume(
        xhr.status >= 200 && xhr.status < 300
          ? Micro.succeed(xhr.response)
          : Micro.die(
              `XHR failed ${xhr.status} ${xhr.statusText} - ${JSON.stringify(xhr.response)}`,
            ),
      );
    });

    // Is there a case when the client would throw and
    // ingest server not knowing about it? idts?
    xhr.addEventListener("error", () => {
      resume(
        new UploadThingError({
          code: "UPLOAD_FAILED",
        }),
      );
    });

    const formData = new FormData();
    formData.append("file", file.slice(rangeStart));
    xhr.send(formData);

    return Micro.sync(() => xhr.abort());
  });