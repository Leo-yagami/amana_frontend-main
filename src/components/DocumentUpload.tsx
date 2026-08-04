import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, ExternalLink, Upload, Link, Download } from "lucide-react";
import { familyApi } from "@/services/api.service";

export interface DocumentItem {
  title: string;
  url: string;
}

interface DocumentUploadProps {
  documents: DocumentItem[];
  onChange: (docs: DocumentItem[]) => void;
  disabled?: boolean;
}

export default function DocumentUpload({
  documents,
  onChange,
  disabled = false,
}: DocumentUploadProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "file">("url");
  const [dragOver, setDragOver] = useState(false);

  const addDocumentByUrl = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const updated = [...documents, { title: newTitle.trim(), url: newUrl.trim() }];
    onChange(updated);
    setNewTitle("");
    setNewUrl("");
  };

  const uploadFile = async (file: File) => {
    if (!newTitle.trim()) {
      toast({
        title: t("common.error"),
        description: t("documentUpload.enterTitleFirst"),
        variant: "destructive",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t("documentUpload.fileTooLarge"),
        description: t("documentUpload.maxFileSize"),
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const response = await familyApi.uploadDocument(file);
      const apiOrigin = import.meta.env.VITE_API_URL || '';
      const fileUrl = response.data.url.startsWith("http")
        ? response.data.url
        : `${apiOrigin}${response.data.url}`;
      const updated = [...documents, { title: newTitle.trim(), url: fileUrl }];
      onChange(updated);
      setNewTitle("");
      setNewUrl("");
      toast({
        title: t("common.success"),
        description: t("documentUpload.uploadSuccess", { name: file.name }),
      });
    } catch (error: any) {
      toast({
        title: t("documentUpload.uploadFailed"),
        description: error.response?.data?.error || t("documentUpload.uploadFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const removeDocument = (index: number) => {
    const updated = documents.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <Label>{t("documentUpload.title")}</Label>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 break-all"
                  >
                    {doc.url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDocument(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 p-3 border rounded-lg">
        <Input
          placeholder={t("documentUpload.titlePlaceholder")}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={disabled || uploading}
          className="text-sm"
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("url")}
            disabled={disabled || uploading}
            className="flex-1"
          >
            <Link className="h-4 w-4 mr-1" />
            {t("documentUpload.url")}
          </Button>
          <Button
            type="button"
            variant={mode === "file" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("file")}
            disabled={disabled || uploading}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            {t("documentUpload.file")}
          </Button>
        </div>

        {mode === "url" ? (
          <div className="flex gap-2">
            <Input
              placeholder={t("documentUpload.urlPlaceholder")}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={disabled || uploading}
              className="text-sm flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addDocumentByUrl}
              disabled={disabled || uploading || !newTitle.trim() || !newUrl.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("common.add")}
            </Button>
          </div>
        ) : (
          <div
            ref={dropRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer min-h-[100px] ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${disabled || uploading ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : dragOver ? (
              <>
                <Download className="h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-primary">{t("documentUpload.dropHere")}</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("documentUpload.dropOrBrowse")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("documentUpload.fileTypesHint")}
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.txt,.csv"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {t("documentUpload.addHint")}
      </p>
    </div>
  );
}
