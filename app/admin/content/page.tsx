"use client";

import { useEffect, useState } from "react";
import type {
  Dispatch,
  FormEvent,
  SetStateAction,
  CSSProperties,
} from "react";

import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

type Series = {
  id: string;
  title: string;
};

type Season = {
  id: string;
  series_id: string;
  season_number: number;
  title: string;
};

type Episode = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  season_number: number;
  episode_number: number;
  thumbnail_url: string | null;
  source_type: string;
  video_url: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  published: boolean;
  sort_order: number;
  series_id: string;
  series?: {
    title: string;
  } | null;
};

type Notice = {
  type: "success" | "error";
  message: string;
};

type EpisodeForm = {
  title: string;
  description: string;
  seriesId: string;
  seasonNumber: string;
  episodeNumber: string;
  thumbnailUrl: string;
  sourceType: string;
  videoUrl: string;
  published: boolean;
};

const emptyEpisodeForm: EpisodeForm = {
  title: "",
  description: "",
  seriesId: "",
  seasonNumber: "1",
  episodeNumber: "1",
  thumbnailUrl: "",
  sourceType: "youtube",
  videoUrl: "",
  published: false,
};

export default function ContentPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  const [loading, setLoading] = useState(true);

  const [notice, setNotice] = useState<Notice | null>(null);

  function showNotice(
    type: Notice["type"],
    message: string
  ) {
    setNotice({ type, message });

    window.setTimeout(() => {
      setNotice(null);
    }, 4000);
  }

  /*
   * ==========================================
   * INLINE CREATE SEASON
   * ==========================================
   */

  const [inlineSeasonTarget, setInlineSeasonTarget] =
    useState<"add" | "edit" | null>(null);

  const [inlineSeasonNumber, setInlineSeasonNumber] =
    useState("1");

  const [inlineSeasonTitle, setInlineSeasonTitle] =
    useState("");

  const [savingInlineSeason, setSavingInlineSeason] =
    useState(false);

  async function deleteSeason() {
    if (!pendingDeleteSeason) {
      return;
    }

    const seasonToDelete = pendingDeleteSeason;

    const attachedEpisodes = episodes.filter(
      (episode) =>
        episode.series_id === seasonToDelete.series_id &&
        episode.season_number === seasonToDelete.season_number
    );

    if (attachedEpisodes.length > 0) {
      showNotice(
        "error",
        `Cannot delete ${seasonToDelete.title || `Season ${seasonToDelete.season_number}`} because it still contains ${attachedEpisodes.length} episode${attachedEpisodes.length === 1 ? "" : "s"}. Move or delete those episodes first.`
      );
      setPendingDeleteSeason(null);
      return;
    }

    setDeletingSeason(true);

    const { error } = await supabase
      .from("seasons")
      .delete()
      .eq("id", seasonToDelete.id);

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to delete season: ${error.message}`
      );

      setDeletingSeason(false);
      return;
    }

    if (selectedSeasonId === seasonToDelete.id) {
      setSelectedSeasonId("");
      setSeasonTitle("");
    }

    setPendingDeleteSeason(null);

    showNotice(
      "success",
      `${seasonToDelete.title || `Season ${seasonToDelete.season_number}`} deleted successfully.`
    );

    await loadContent();

    setDeletingSeason(false);
  }

  async function saveEpisodeSeasonTitle(
    seasonId: string,
    title: string
  ) {
    const season = seasons.find(
      (item) => item.id === seasonId
    );

    if (!season) {
      showNotice("error", "Season not found.");
      return false;
    }

    const finalTitle =
      title.trim() ||
      `Season ${season.season_number}`;

    const { error } = await supabase
      .from("seasons")
      .update({
        title: finalTitle,
      })
      .eq("id", seasonId);

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to update season title: ${error.message}`
      );

      return false;
    }

    showNotice(
      "success",
      `Season ${season.season_number} title updated.`
    );

    await loadContent();

    return true;
  }

  /*
   * ==========================================
   * ADD EPISODE
   * ==========================================
   */

  const [showAddForm, setShowAddForm] = useState(false);

  const [addForm, setAddForm] =
    useState<EpisodeForm>(emptyEpisodeForm);

  const [savingAdd, setSavingAdd] = useState(false);

  /*
   * ==========================================
   * EDIT EPISODE
   * ==========================================
   */

  const [editingEpisode, setEditingEpisode] =
    useState<Episode | null>(null);

  const [editForm, setEditForm] =
    useState<EpisodeForm>(emptyEpisodeForm);

  const [savingEdit, setSavingEdit] = useState(false);

  /*
   * ==========================================
   * SEASON MANAGEMENT
   * ==========================================
   */

  const [selectedSeasonId, setSelectedSeasonId] =
    useState("");

  const [seasonTitle, setSeasonTitle] = useState("");

  const [savingSeason, setSavingSeason] =
    useState(false);

  const [pendingDeleteSeason, setPendingDeleteSeason] =
    useState<Season | null>(null);

  const [deletingSeason, setDeletingSeason] =
    useState(false);

  /*
   * ==========================================
   * GLOBAL CREATE SEASON
   * ==========================================
   */

  const [showCreateSeason, setShowCreateSeason] =
    useState(false);

  const [newSeasonSeriesId, setNewSeasonSeriesId] =
    useState("");

  const [newSeasonNumber, setNewSeasonNumber] =
    useState("1");

  const [newSeasonTitle, setNewSeasonTitle] =
    useState("");

  const [savingNewSeason, setSavingNewSeason] =
    useState(false);

  /*
   * ==========================================
   * LOAD CONTENT
   * ==========================================
   */

  async function loadContent() {
    setLoading(true);

    const [
      episodesResult,
      seriesResult,
      seasonsResult,
    ] = await Promise.all([
      supabase
        .from("episodes")
        .select(
          `
          id,
          title,
          slug,
          description,
          season_number,
          episode_number,
          thumbnail_url,
          source_type,
          video_url,
          storage_path,
          duration_seconds,
          published,
          sort_order,
          series_id,
          series (
            title
          )
        `
        )
        .order("season_number", {
          ascending: true,
        })
        .order("episode_number", {
          ascending: true,
        }),

      supabase
        .from("series")
        .select("id, title")
        .order("sort_order", {
          ascending: true,
        }),

      supabase
        .from("seasons")
        .select(
          `
          id,
          series_id,
          season_number,
          title
        `
        )
        .order("season_number", {
          ascending: true,
        }),
    ]);

    if (episodesResult.error) {
      console.error(
        "EPISODES ERROR:",
        episodesResult.error
      );
    } else {
      setEpisodes(
        (episodesResult.data as unknown as Episode[]) ||
          []
      );
    }

    if (seriesResult.error) {
      console.error(
        "SERIES ERROR:",
        seriesResult.error
      );
    } else {
      setSeries(seriesResult.data || []);
    }

    if (seasonsResult.error) {
      console.error(
        "SEASONS ERROR:",
        seasonsResult.error
      );
    } else {
      setSeasons(
        (seasonsResult.data as Season[]) || []
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadContent();
  }, []);

  /*
   * ==========================================
   * SEASON HELPERS
   * ==========================================
   */

  function getSeasonsForSeries(
    seriesId: string
  ) {
    return seasons
      .filter(
        (season) =>
          season.series_id === seriesId
      )
      .sort(
        (a, b) =>
          a.season_number -
          b.season_number
      );
  }

  function getSeasonTitle(
    seriesId: string,
    seasonNumber: number
  ) {
    return (
      seasons.find(
        (season) =>
          season.series_id === seriesId &&
          season.season_number ===
            seasonNumber
      )?.title ||
      `Season ${seasonNumber}`
    );
  }

  /*
   * ==========================================
   * CREATE SEASON - CORE FUNCTION
   * ==========================================
   *
   * This is used by:
   * 1. Global Season Management
   * 2. Add Video
   * 3. Edit Episode
   *
   * Season title is OPTIONAL.
   *
   * Empty title becomes:
   * "Season X"
   */

  async function createSeason(
    seriesId: string,
    seasonNumber: number,
    customTitle: string
  ): Promise<Season | null> {
    if (!seriesId) {
      showNotice(
        "error",
        "Please select a series."
      );
      return null;
    }

    if (
      !Number.isInteger(seasonNumber) ||
      seasonNumber < 1
    ) {
      showNotice(
        "error",
        "Season number must be at least 1."
      );
      return null;
    }

    const alreadyExists = seasons.some(
      (season) =>
        season.series_id === seriesId &&
        season.season_number === seasonNumber
    );

    if (alreadyExists) {
      showNotice(
        "error",
        `Season ${seasonNumber} already exists for this series.`
      );
      return null;
    }

    const finalTitle =
      customTitle.trim() ||
      `Season ${seasonNumber}`;

    const { data, error } = await supabase
      .from("seasons")
      .insert({
        series_id: seriesId,
        season_number: seasonNumber,
        title: finalTitle,
      })
      .select(
        "id, series_id, season_number, title"
      )
      .single();

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to create season: ${error.message}`
      );

      return null;
    }

    const createdSeason = data as Season;

    setSeasons((current) =>
      [...current, createdSeason].sort(
        (a, b) =>
          a.season_number - b.season_number
      )
    );

    return createdSeason;
  }

  /*
   * ==========================================
   * GLOBAL CREATE SEASON
   * ==========================================
   */

  async function handleCreateSeason(
    e: FormEvent
  ) {
    e.preventDefault();

    const seasonNumber = Number(
      newSeasonNumber
    );

    setSavingNewSeason(true);

    const createdSeason =
      await createSeason(
        newSeasonSeriesId,
        seasonNumber,
        newSeasonTitle
      );

    setSavingNewSeason(false);

    if (!createdSeason) {
      return;
    }

    showNotice(
      "success",
      `Season ${createdSeason.season_number} created successfully.`
    );

    setNewSeasonSeriesId("");
    setNewSeasonNumber("1");
    setNewSeasonTitle("");
    setShowCreateSeason(false);

    await loadContent();
  }

  /*
   * ==========================================
   * SEASON TITLE EDITING
   * ==========================================
   */

  function selectSeason(
    seasonId: string
  ) {
    setSelectedSeasonId(seasonId);

    const season = seasons.find(
      (item) => item.id === seasonId
    );

    setSeasonTitle(
      season?.title || ""
    );
  }

  async function saveSeasonTitle() {
    if (!selectedSeasonId) {
      showNotice("error", "Please select a season.");
      return;
    }

    const season = seasons.find(
      (item) =>
        item.id === selectedSeasonId
    );

    if (!season) {
      showNotice("error", "Season not found.");
      return;
    }

    const finalTitle =
      seasonTitle.trim() ||
      `Season ${season.season_number}`;

    setSavingSeason(true);

    const { error } =
      await supabase
        .from("seasons")
        .update({
          title: finalTitle,
        })
        .eq(
          "id",
          selectedSeasonId
        );

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to update season: ${error.message}`
      );

      setSavingSeason(false);
      return;
    }

    showNotice(
      "success",
      "Season title updated successfully."
    );

    await loadContent();

    setSavingSeason(false);
  }

  /*
   * ==========================================
   * ADD EPISODE
   * ==========================================
   */

  function resetAddForm() {
    setAddForm({
      ...emptyEpisodeForm,
      seriesId:
        series[0]?.id || "",
    });
  }

  async function handleCreateEpisode(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!addForm.title.trim()) {
      showNotice(
        "error",
        "Please enter an episode title."
      );
      return;
    }

    if (!addForm.seriesId) {
      showNotice("error", "Please select a series.");
      return;
    }

    if (
      addForm.sourceType !==
        "upload" &&
      !addForm.videoUrl.trim()
    ) {
      showNotice(
        "error",
        "Please enter a video URL."
      );
      return;
    }

    const seasonNumber = Number(
      addForm.seasonNumber
    );

    const episodeNumber = Number(
      addForm.episodeNumber
    );

    if (
      seasonNumber < 1 ||
      episodeNumber < 1
    ) {
      showNotice(
        "error",
        "Season and episode numbers must be at least 1."
      );
      return;
    }

    const seasonExists =
      seasons.some(
        (season) =>
          season.series_id ===
            addForm.seriesId &&
          season.season_number ===
            seasonNumber
      );

    if (!seasonExists) {
      showNotice(
        "error",
        `Season ${seasonNumber} does not exist for this series. Create it first using "+ New Season".`
      );
      return;
    }

    const duplicate =
      episodes.find(
        (episode) =>
          episode.series_id ===
            addForm.seriesId &&
          episode.season_number ===
            seasonNumber &&
          episode.episode_number ===
            episodeNumber
      );

    if (duplicate) {
      showNotice(
        "error",
        `Season ${seasonNumber}, Episode ${episodeNumber} is already occupied by "${duplicate.title}".`
      );
      return;
    }

    setSavingAdd(true);

    const slug = `${addForm.title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )}-${Date.now()}`;

    const { error } =
      await supabase
        .from("episodes")
        .insert({
          series_id:
            addForm.seriesId,
          title:
            addForm.title.trim(),
          slug,
          description:
            addForm.description.trim() ||
            null,
          season_number:
            seasonNumber,
          episode_number:
            episodeNumber,
          thumbnail_url:
            addForm.thumbnailUrl.trim() ||
            null,
          source_type:
            addForm.sourceType,
          video_url:
            addForm.sourceType ===
            "upload"
              ? null
              : addForm.videoUrl.trim() ||
                null,
          storage_path: null,
          duration_seconds: null,
          published:
            addForm.published,
          sort_order:
            episodeNumber,
        });

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to create episode: ${error.message}`
      );

      setSavingAdd(false);
      return;
    }

    showNotice(
      "success",
      "Episode created successfully."
    );

    resetAddForm();
    setShowAddForm(false);

    await loadContent();

    setSavingAdd(false);
  }

  /*
   * ==========================================
   * EDIT EPISODE
   * ==========================================
   */

  function openEditEpisode(
    episode: Episode
  ) {
    closeInlineCreateSeason();
    setEditingEpisode(episode);

    setEditForm({
      title: episode.title,
      description:
        episode.description || "",
      seriesId:
        episode.series_id,
      seasonNumber:
        String(
          episode.season_number
        ),
      episodeNumber:
        String(
          episode.episode_number
        ),
      thumbnailUrl:
        episode.thumbnail_url || "",
      sourceType:
        episode.source_type,
      videoUrl:
        episode.video_url || "",
      published:
        episode.published,
    });
  }

  function closeEditEpisode() {
    setEditingEpisode(null);
    setEditForm(emptyEpisodeForm);
    closeInlineCreateSeason();
  }

  async function handleSaveEpisode(
    e: FormEvent
  ) {
    e.preventDefault();

    if (!editingEpisode) {
      return;
    }

    if (!editForm.title.trim()) {
      showNotice(
        "error",
        "Please enter an episode title."
      );
      return;
    }

    if (!editForm.seriesId) {
      showNotice(
        "error",
        "Please select a series."
      );
      return;
    }

    if (
      editForm.sourceType !==
        "upload" &&
      !editForm.videoUrl.trim()
    ) {
      showNotice(
        "error",
        "Please enter a video URL."
      );
      return;
    }

    const seasonNumber = Number(
      editForm.seasonNumber
    );

    const episodeNumber = Number(
      editForm.episodeNumber
    );

    if (
      seasonNumber < 1 ||
      episodeNumber < 1
    ) {
      showNotice(
        "error",
        "Season and episode numbers must be at least 1."
      );
      return;
    }

    /*
     * The target season MUST exist.
     *
     * If you want S3 E8 and Season 3
     * doesn't exist yet, click "+ New Season"
     * inside the editor first.
     */

    const targetSeason =
      seasons.find(
        (season) =>
          season.series_id ===
            editForm.seriesId &&
          season.season_number ===
            seasonNumber
      );

    if (!targetSeason) {
      showNotice(
        "error",
        `Season ${seasonNumber} does not exist for this series. Click "+ New Season" and create it first.`
      );
      return;
    }

    /*
     * Prevent duplicate positions.
     */

    const duplicate =
      episodes.find(
        (episode) =>
          episode.id !==
            editingEpisode.id &&
          episode.series_id ===
            editForm.seriesId &&
          episode.season_number ===
            seasonNumber &&
          episode.episode_number ===
            episodeNumber
      );

    if (duplicate) {
      showNotice(
        "error",
        `Cannot move this episode there. Season ${seasonNumber}, Episode ${episodeNumber} already belongs to "${duplicate.title}".`
      );
      return;
    }

    setSavingEdit(true);

    const { error } =
      await supabase
        .from("episodes")
        .update({
          title:
            editForm.title.trim(),

          description:
            editForm.description.trim() ||
            null,

          series_id:
            editForm.seriesId,

          season_number:
            seasonNumber,

          episode_number:
            episodeNumber,

          thumbnail_url:
            editForm.thumbnailUrl.trim() ||
            null,

          source_type:
            editForm.sourceType,

          video_url:
            editForm.sourceType ===
            "upload"
              ? null
              : editForm.videoUrl.trim() ||
                null,

          published:
            editForm.published,

          sort_order:
            episodeNumber,
        })
        .eq(
          "id",
          editingEpisode.id
        );

    if (error) {
      console.error(error);

      showNotice(
        "error",
        `Failed to update episode: ${error.message}`
      );

      setSavingEdit(false);
      return;
    }

    showNotice(
      "success",
      "Episode updated successfully."
    );

    closeEditEpisode();

    await loadContent();

    setSavingEdit(false);
  }

  /*
   * ==========================================
   * PUBLISH / DRAFT
   * ==========================================
   */

  async function togglePublished(
    episode: Episode
  ) {
    const { error } =
      await supabase
        .from("episodes")
        .update({
          published:
            !episode.published,
        })
        .eq(
          "id",
          episode.id
        );

    if (error) {
      showNotice(
        "error",
        `Failed to update episode: ${error.message}`
      );
      return;
    }

    await loadContent();
  }

  /*
   * ==========================================
   * DELETE EPISODE
   * ==========================================
   */

  async function deleteEpisode(
    episode: Episode
  ) {
    const confirmed =
      window.confirm(
        `Delete "${episode.title}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("episodes")
        .delete()
        .eq(
          "id",
          episode.id
        );

    if (error) {
      showNotice(
        "error",
        `Failed to delete episode: ${error.message}`
      );
      return;
    }

    await loadContent();
  }

  /*
   * ==========================================
   * CREATE SEASON FROM EPISODE FORM
   * ==========================================
   */

  function openInlineCreateSeason(
    target: "add" | "edit",
    form: EpisodeForm
  ) {
    if (!form.seriesId) {
      showNotice(
        "error",
        "Please select a series first."
      );
      return;
    }

    const existingNumbers = getSeasonsForSeries(
      form.seriesId
    ).map((season) => season.season_number);

    const requestedNumber = Number(form.seasonNumber);
    const suggestedNumber =
      Number.isInteger(requestedNumber) &&
      requestedNumber > 0 &&
      !existingNumbers.includes(requestedNumber)
        ? requestedNumber
        : existingNumbers.length > 0
          ? Math.max(...existingNumbers) + 1
          : 1;

    setInlineSeasonTarget(target);
    setInlineSeasonNumber(String(suggestedNumber));
    setInlineSeasonTitle("");
  }

  function closeInlineCreateSeason() {
    setInlineSeasonTarget(null);
    setInlineSeasonNumber("1");
    setInlineSeasonTitle("");
  }

  async function handleInlineCreateSeason() {
    const target = inlineSeasonTarget;

    if (!target) {
      return;
    }

    const targetForm =
      target === "add" ? addForm : editForm;

    const seasonNumber = Number(inlineSeasonNumber);

    if (!targetForm.seriesId) {
      showNotice(
        "error",
        "Please select a series first."
      );
      return;
    }

    if (
      !Number.isInteger(seasonNumber) ||
      seasonNumber < 1
    ) {
      showNotice(
        "error",
        "Enter a valid season number of 1 or higher."
      );
      return;
    }

    setSavingInlineSeason(true);

    const createdSeason = await createSeason(
      targetForm.seriesId,
      seasonNumber,
      inlineSeasonTitle
    );

    setSavingInlineSeason(false);

    if (!createdSeason) {
      return;
    }

    const updateForm =
      target === "add"
        ? setAddForm
        : setEditForm;

    updateForm((current: EpisodeForm) => ({
      ...current,
      seasonNumber: String(
        createdSeason.season_number
      ),
    }));

    closeInlineCreateSeason();

    showNotice(
      "success",
      `Season ${createdSeason.season_number} is ready. You can now use it for this episode.`
    );
  }

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding:
          "120px 40px 100px",
      }}
    >
      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: "90px",
            right: "30px",
            zIndex: 10000,
            maxWidth: "420px",
            background:
              notice.type === "success"
                ? "#102318"
                : "#261313",
            border:
              notice.type === "success"
                ? "1px solid #285c3b"
                : "1px solid #633333",
            color:
              notice.type === "success"
                ? "#9af0bb"
                : "#ffaaaa",
            borderRadius: "10px",
            padding: "14px 16px",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.45)",
            fontSize: "14px",
            lineHeight: 1.45,
          }}
        >
          {notice.message}
        </div>
      )}

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "42px",
                margin: 0,
                fontWeight: 700,
              }}
            >
              Content
            </h1>

            <p
              style={{
                color: "#888",
                marginTop:
                  "10px",
                fontSize: "15px",
              }}
            >
              Manage videos,
              episodes, seasons
              and published
              content.
            </p>
          </div>

          <button
            onClick={() => {
              resetAddForm();
              setShowAddForm(true);
            }}
            style={
              primaryButtonStyle
            }
          >
            + Add Video
          </button>
        </div>

        {/* =====================================
            SEASON MANAGEMENT
        ===================================== */}

        <div
          style={panelStyle}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom:
                "20px",
              gap: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                }}
              >
                Season Management
              </h2>

              <p
                style={{
                  color: "#777",
                  marginTop:
                    "7px",
                  marginBottom: 0,
                  fontSize:
                    "14px",
                }}
              >
                Create seasons and
                edit their titles.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateSeason(
                  !showCreateSeason
                )
              }
              style={
                secondaryButtonStyle
              }
            >
              {showCreateSeason
                ? "Cancel"
                : "+ Create Season"}
            </button>
          </div>

          {showCreateSeason && (
            <form
              onSubmit={
                handleCreateSeason
              }
              style={{
                background:
                  "#0b0b0b",
                border:
                  "1px solid #292929",
                borderRadius:
                  "12px",
                padding: "20px",
                marginBottom:
                  "25px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "17px",
                }}
              >
                Create New Season
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 180px 1fr auto",
                  gap: "15px",
                  alignItems:
                    "end",
                }}
              >
                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Series
                  </label>

                  <select
                    value={
                      newSeasonSeriesId
                    }
                    onChange={(e) =>
                      setNewSeasonSeriesId(
                        e.target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  >
                    <option value="">
                      Select series
                    </option>

                    {series.map(
                      (item) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.title
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Season Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      newSeasonNumber
                    }
                    onChange={(e) =>
                      setNewSeasonNumber(
                        e.target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Season Title
                    <span
                      style={{
                        color:
                          "#666",
                        marginLeft:
                          "5px",
                        fontWeight:
                          400,
                      }}
                    >
                      (optional)
                    </span>
                  </label>

                  <input
                    value={
                      newSeasonTitle
                    }
                    onChange={(e) =>
                      setNewSeasonTitle(
                        e.target
                          .value
                      )
                    }
                    placeholder="Leave empty for Season 2"
                    style={
                      inputStyle
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    savingNewSeason
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      savingNewSeason
                        ? 0.6
                        : 1,
                  }}
                >
                  {savingNewSeason
                    ? "Saving..."
                    : "Create"}
                </button>
              </div>
            </form>
          )}

          {/* EDIT SEASON TITLE */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr auto auto",
              gap: "15px",
              alignItems:
                "end",
            }}
          >
            <div>
              <label
                style={
                  labelStyle
                }
              >
                Select Season
              </label>

              <select
                value={
                  selectedSeasonId
                }
                onChange={(e) =>
                  selectSeason(
                    e.target.value
                  )
                }
                style={
                  inputStyle
                }
              >
                <option value="">
                  Select a season
                </option>

                {seasons.map(
                  (season) => {
                    const seriesTitle =
                      series.find(
                        (item) =>
                          item.id ===
                          season.series_id
                      )?.title ||
                      "Unknown";

                    return (
                      <option
                        key={
                          season.id
                        }
                        value={
                          season.id
                        }
                      >
                        {seriesTitle} —
                        Season{" "}
                        {
                          season.season_number
                        } —{" "}
                        {season.title ||
                          `Season ${season.season_number}`}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            <div>
              <label
                style={
                  labelStyle
                }
              >
                Season Title
                <span
                  style={{
                    color:
                      "#666",
                    marginLeft:
                      "5px",
                    fontWeight:
                      400,
                  }}
                >
                  (optional)
                </span>
              </label>

              <input
                value={
                  seasonTitle
                }
                onChange={(e) =>
                  setSeasonTitle(
                    e.target
                      .value
                  )
                }
                disabled={
                  !selectedSeasonId
                }
                placeholder="Leave empty for Season X"
                style={
                  inputStyle
                }
              />
            </div>

            <button
              type="button"
              onClick={
                saveSeasonTitle
              }
              disabled={
                !selectedSeasonId ||
                savingSeason
              }
              style={{
                ...primaryButtonStyle,
                opacity:
                  !selectedSeasonId ||
                  savingSeason
                    ? 0.5
                    : 1,
              }}
            >
              {savingSeason
                ? "Saving..."
                : "Save Title"}
            </button>

            <button
              type="button"
              onClick={() => {
                const season = seasons.find(
                  (item) =>
                    item.id ===
                    selectedSeasonId
                );

                if (season) {
                  setPendingDeleteSeason(
                    season
                  );
                }
              }}
              disabled={
                !selectedSeasonId ||
                savingSeason ||
                deletingSeason
              }
              style={{
                ...dangerButtonStyle,
                opacity:
                  !selectedSeasonId ||
                  savingSeason ||
                  deletingSeason
                    ? 0.5
                    : 1,
              }}
            >
              Delete Season
            </button>
          </div>

          {pendingDeleteSeason && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px 18px",
                borderRadius: "10px",
                border: "1px solid #4a2626",
                background: "#160c0c",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Delete{" "}
                  {pendingDeleteSeason.title ||
                    `Season ${pendingDeleteSeason.season_number}`}
                  ?
                </div>

                <div
                  style={{
                    color: "#999",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  A season can only be deleted when it has no episodes.
                  This prevents accidental content loss.
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setPendingDeleteSeason(null)
                  }
                  disabled={deletingSeason}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteSeason}
                  disabled={deletingSeason}
                  style={{
                    ...dangerButtonStyle,
                    opacity: deletingSeason
                      ? 0.6
                      : 1,
                  }}
                >
                  {deletingSeason
                    ? "Deleting..."
                    : "Confirm Delete"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================
            ADD VIDEO
        ===================================== */}

        {showAddForm && (
          <div
            style={{
              background:
                "#111",
              border:
                "1px solid #262626",
              borderRadius:
                "16px",
              padding: "30px",
              marginBottom:
                "40px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "24px",
                  }}
                >
                  Add Video
                </h2>

                <p
                  style={{
                    color:
                      "#666",
                    margin:
                      "7px 0 0",
                    fontSize:
                      "13px",
                  }}
                >
                  You can create a
                  new season directly
                  from the form.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetAddForm();
                  closeInlineCreateSeason();
                }}
                style={{
                  background:
                    "transparent",
                  color:
                    "#888",
                  border:
                    "none",
                  fontSize:
                    "22px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleCreateEpisode
              }
            >
              <EpisodeFields
                form={addForm}
                setForm={setAddForm}
                series={series}
                seasons={seasons}
                onCreateSeason={() =>
                  openInlineCreateSeason(
                    "add",
                    addForm
                  )
                }
                onSaveSeasonTitle={
                  saveEpisodeSeasonTitle
                }
              />

              <InlineSeasonCreator
                open={
                  inlineSeasonTarget === "add"
                }
                seasonNumber={
                  inlineSeasonNumber
                }
                seasonTitle={
                  inlineSeasonTitle
                }
                saving={
                  savingInlineSeason
                }
                onSeasonNumberChange={
                  setInlineSeasonNumber
                }
                onSeasonTitleChange={
                  setInlineSeasonTitle
                }
                onCreate={
                  handleInlineCreateSeason
                }
                onCancel={
                  closeInlineCreateSeason
                }
              />

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "12px",
                  marginTop:
                    "30px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid #222",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(
                      false
                    );
                    resetAddForm();
                  }}
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingAdd
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      savingAdd
                        ? 0.6
                        : 1,
                  }}
                >
                  {savingAdd
                    ? "Saving..."
                    : "Save Video"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================
            CONTENT LIST
        ===================================== */}

        <div
          style={{
            background:
              "#111",
            border:
              "1px solid #222",
            borderRadius:
              "16px",
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              padding:
                "20px 24px",
              borderBottom:
                "1px solid #222",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize:
                  "20px",
              }}
            >
              Videos
            </h2>
          </div>

          {loading ? (
            <div
              style={{
                padding:
                  "50px",
                textAlign:
                  "center",
                color:
                  "#777",
              }}
            >
              Loading content...
            </div>
          ) : episodes.length ===
            0 ? (
            <div
              style={{
                padding:
                  "60px 30px",
                textAlign:
                  "center",
                color:
                  "#777",
              }}
            >
              <div
                style={{
                  fontSize:
                    "18px",
                  color:
                    "#aaa",
                  marginBottom:
                    "8px",
                }}
              >
                No videos yet
              </div>

              <div
                style={{
                  fontSize:
                    "14px",
                }}
              >
                Click “Add Video”
                to create your
                first episode.
              </div>
            </div>
          ) : (
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                  minWidth:
                    "1000px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        "1px solid #222",
                      textAlign:
                        "left",
                    }}
                  >
                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Video
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Series
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Position
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Source
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {episodes.map(
                    (episode) => (
                      <tr
                        key={
                          episode.id
                        }
                        style={{
                          borderBottom:
                            "1px solid #1e1e1e",
                        }}
                      >
                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "14px",
                            }}
                          >
                            {episode.thumbnail_url ? (
                              <img
                                src={
                                  episode.thumbnail_url
                                }
                                alt=""
                                style={{
                                  width:
                                    "70px",
                                  height:
                                    "42px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#222",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width:
                                    "70px",
                                  height:
                                    "42px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#222",
                                }}
                              />
                            )}

                            <div>
                              <div
                                style={{
                                  fontWeight:
                                    600,
                                  color:
                                    "#fff",
                                }}
                              >
                                {
                                  episode.title
                                }
                              </div>

                              <div
                                style={{
                                  color:
                                    "#666",
                                  fontSize:
                                    "12px",
                                  marginTop:
                                    "4px",
                                }}
                              >
                                {
                                  episode.slug
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {episode
                            .series
                            ?.title ||
                            "—"}
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <div
                            style={{
                              color:
                                "#fff",
                              fontWeight:
                                600,
                            }}
                          >
                            S
                            {
                              episode.season_number
                            }{" "}
                            E
                            {
                              episode.episode_number
                            }
                          </div>

                          <div
                            style={{
                              color:
                                "#666",
                              fontSize:
                                "12px",
                              marginTop:
                                "4px",
                            }}
                          >
                            {getSeasonTitle(
                              episode.series_id,
                              episode.season_number
                            )}
                          </div>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              textTransform:
                                "capitalize",
                              color:
                                "#aaa",
                            }}
                          >
                            {
                              episode.source_type
                            }
                          </span>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              togglePublished(
                                episode
                              )
                            }
                            style={{
                              background:
                                episode.published
                                  ? "#163b24"
                                  : "#2a2a2a",
                              color:
                                episode.published
                                  ? "#6ee7a0"
                                  : "#999",
                              border:
                                "none",
                              borderRadius:
                                "20px",
                              padding:
                                "6px 11px",
                              fontSize:
                                "12px",
                              cursor:
                                "pointer",
                            }}
                          >
                            {episode.published
                              ? "Published"
                              : "Draft"}
                          </button>
                        </td>

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "8px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openEditEpisode(
                                  episode
                                )
                              }
                              style={{
                                background:
                                  "#fff",
                                color:
                                  "#000",
                                border:
                                  "none",
                                borderRadius:
                                  "6px",
                                padding:
                                  "7px 13px",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  600,
                              }}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteEpisode(
                                  episode
                                )
                              }
                              style={{
                                background:
                                  "transparent",
                                color:
                                  "#e57373",
                                border:
                                  "1px solid #422",
                                borderRadius:
                                  "6px",
                                padding:
                                  "7px 12px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =======================================
          EDIT EPISODE MODAL
      ======================================= */}

      {editingEpisode && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.82)",
            zIndex: 9999,
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "30px",
          }}
        >
          <div
            style={{
              width:
                "100%",
              maxWidth:
                "900px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#111",
              border:
                "1px solid #333",
              borderRadius:
                "16px",
              padding:
                "30px",
              boxShadow:
                "0 30px 100px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "26px",
                  }}
                >
                  Edit Episode
                </h2>

                <p
                  style={{
                    color:
                      "#777",
                    margin:
                      "7px 0 0",
                    fontSize:
                      "14px",
                  }}
                >
                  Change all
                  episode
                  information,
                  including
                  its season
                  and episode
                  position.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeEditEpisode
                }
                style={{
                  background:
                    "transparent",
                  color:
                    "#888",
                  border:
                    "none",
                  fontSize:
                    "28px",
                  cursor:
                    "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleSaveEpisode
              }
            >
              <EpisodeFields
                form={editForm}
                setForm={setEditForm}
                series={series}
                seasons={seasons}
                onCreateSeason={() =>
                  openInlineCreateSeason(
                    "edit",
                    editForm
                  )
                }
                onSaveSeasonTitle={
                  saveEpisodeSeasonTitle
                }
              />

              <InlineSeasonCreator
                open={
                  inlineSeasonTarget === "edit"
                }
                seasonNumber={
                  inlineSeasonNumber
                }
                seasonTitle={
                  inlineSeasonTitle
                }
                saving={
                  savingInlineSeason
                }
                onSeasonNumberChange={
                  setInlineSeasonNumber
                }
                onSeasonTitleChange={
                  setInlineSeasonTitle
                }
                onCreate={
                  handleInlineCreateSeason
                }
                onCancel={
                  closeInlineCreateSeason
                }
              />

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "12px",
                  marginTop:
                    "30px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid #222",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeEditEpisode
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingEdit
                  }
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      savingEdit
                        ? 0.6
                        : 1,
                  }}
                >
                  {savingEdit
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/*
 * ============================================
 * EPISODE FIELDS
 * ============================================
 */

type EpisodeFieldsProps = {
  form: EpisodeForm;
  setForm: Dispatch<
    SetStateAction<EpisodeForm>
  >;
  series: Series[];
  seasons: Season[];
  onCreateSeason: () => void;
  onSaveSeasonTitle: (
    seasonId: string,
    title: string
  ) => Promise<boolean>;
};

type InlineSeasonCreatorProps = {
  open: boolean;
  seasonNumber: string;
  seasonTitle: string;
  saving: boolean;
  onSeasonNumberChange: (value: string) => void;
  onSeasonTitleChange: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
};

function InlineSeasonCreator({
  open,
  seasonNumber,
  seasonTitle,
  saving,
  onSeasonNumberChange,
  onSeasonTitleChange,
  onCreate,
  onCancel,
}: InlineSeasonCreatorProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        background: "#0b0b0b",
        border: "1px solid #303030",
        borderRadius: "12px",
        padding: "18px",
        marginTop: "-5px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "15px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Create New Season
          </div>

          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "4px",
            }}
          >
            The title is optional. You can rename it later.
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "transparent",
            color: "#777",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr auto auto",
          gap: "12px",
          alignItems: "end",
        }}
      >
        <div>
          <label style={labelStyle}>
            Season Number
          </label>

          <input
            type="number"
            min="1"
            value={seasonNumber}
            onChange={(e) =>
              onSeasonNumberChange(e.target.value)
            }
            style={inputStyle}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>
            Season Title
            <span
              style={{
                color: "#666",
                marginLeft: "5px",
                fontWeight: 400,
              }}
            >
              (optional)
            </span>
          </label>

          <input
            value={seasonTitle}
            onChange={(e) =>
              onSeasonTitleChange(e.target.value)
            }
            placeholder="Leave empty for Season X"
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={secondaryButtonStyle}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onCreate}
          disabled={saving}
          style={{
            ...primaryButtonStyle,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Creating..." : "Create Season"}
        </button>
      </div>
    </div>
  );
}

function EpisodeFields({
  form,
  setForm,
  series,
  seasons,
  onCreateSeason,
  onSaveSeasonTitle,
}: EpisodeFieldsProps) {
  const [editingSeasonTitle, setEditingSeasonTitle] =
    useState("");

  const [savingEpisodeSeasonTitle, setSavingEpisodeSeasonTitle] =
    useState(false);

  const availableSeasons =
    seasons
      .filter(
        (season) =>
          season.series_id ===
          form.seriesId
      )
      .sort(
        (a, b) =>
          a.season_number -
          b.season_number
      );

  function update(
    field: keyof EpisodeForm,
    value:
      | string
      | boolean
  ) {
    setForm((current: EpisodeForm) => ({
      ...current,
      [field]: value,
    }));
  }

  function changeSeries(
    value: string
  ) {
    const firstSeason =
      seasons
        .filter(
          (season) =>
            season.series_id ===
            value
        )
        .sort(
          (a, b) =>
            a.season_number -
            b.season_number
        )[0];

    setForm((current: EpisodeForm) => ({
      ...current,
      seriesId:
        value,
      seasonNumber:
        firstSeason
          ? String(
              firstSeason.season_number
            )
          : "1",
    }));
  }

  const selectedSeason = availableSeasons.find(
    (season) =>
      season.season_number ===
      Number(form.seasonNumber)
  );

  useEffect(() => {
    setEditingSeasonTitle(
      selectedSeason?.title ||
        (selectedSeason
          ? `Season ${selectedSeason.season_number}`
          : "")
    );
  }, [
    selectedSeason?.id,
    selectedSeason?.title,
    selectedSeason?.season_number,
  ]);

  async function handleSaveSelectedSeasonTitle() {
    if (!selectedSeason) {
      return;
    }

    setSavingEpisodeSeasonTitle(true);

    const success =
      await onSaveSeasonTitle(
        selectedSeason.id,
        editingSeasonTitle
      );

    setSavingEpisodeSeasonTitle(false);

    if (success) {
      setEditingSeasonTitle(
        editingSeasonTitle.trim() ||
          `Season ${selectedSeason.season_number}`
      );
    }
  }

  return (
    <div
      style={{
        display:
          "grid",
        gridTemplateColumns:
          "1fr 1fr",
        gap:
          "20px",
      }}
    >
      {/* EPISODE TITLE */}

      <div
        style={{
          gridColumn:
            "1 / -1",
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Episode Title
        </label>

        <input
          value={
            form.title
          }
          onChange={(e) =>
            update(
              "title",
              e.target
                .value
            )
          }
          placeholder="Puku — The Magical Bridge"
          style={
            inputStyle
          }
        />
      </div>

      {/* DESCRIPTION */}

      <div
        style={{
          gridColumn:
            "1 / -1",
        }}
      >
        <label
          style={
            labelStyle
          }
        >
          Description
        </label>

        <textarea
          value={
            form.description
          }
          onChange={(e) =>
            update(
              "description",
              e.target
                .value
            )
          }
          placeholder="Episode description..."
          rows={5}
          style={{
            ...inputStyle,
            resize:
              "vertical",
          }}
        />
      </div>

      {/* SERIES */}

      <div>
        <label
          style={
            labelStyle
          }
        >
          Series
        </label>

        <select
          value={
            form.seriesId
          }
          onChange={(e) =>
            changeSeries(
              e.target
                .value
            )
          }
          style={
            inputStyle
          }
        >
          <option value="">
            Select a series
          </option>

          {series.map(
            (item) => (
              <option
                key={
                  item.id
                }
                value={
                  item.id
                }
              >
                {
                  item.title
                }
              </option>
            )
          )}
        </select>
      </div>

      {/* SEASON */}

      <div>
        <label
          style={
            labelStyle
          }
        >
          Season
        </label>

        <div
          style={{
            display:
              "flex",
            gap:
              "8px",
          }}
        >
          <select
            value={
              form.seasonNumber
            }
            onChange={(e) =>
              update(
                "seasonNumber",
                e.target
                  .value
              )
            }
            style={{
              ...inputStyle,
              flex: 1,
            }}
            disabled={
              !form.seriesId
            }
          >
            {availableSeasons.length ===
            0 ? (
              <option value="">
                No seasons available
              </option>
            ) : (
              availableSeasons.map(
                (season) => (
                  <option
                    key={
                      season.id
                    }
                    value={String(
                      season.season_number
                    )}
                  >
                    Season{" "}
                    {
                      season.season_number
                    }{" "}
                    —{" "}
                    {
                      season.title ||
                      `Season ${season.season_number}`
                    }
                  </option>
                )
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              onCreateSeason
            }
            disabled={
              !form.seriesId
            }
            style={{
              ...secondaryButtonStyle,
              padding:
                "12px 14px",
              opacity:
                !form.seriesId
                  ? 0.5
                  : 1,
            }}
          >
            + New Season
          </button>
        </div>

        <p
          style={{
            color:
              "#666",
            fontSize:
              "12px",
            margin:
              "6px 0 0",
          }}
        >
          Need a new season?
          Click + New Season.
        </p>

        {selectedSeason && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #202020",
            }}
          >
            <label style={labelStyle}>
              Season Title
              <span
                style={{
                  color: "#666",
                  marginLeft: "5px",
                  fontWeight: 400,
                }}
              >
                (editable)
              </span>
            </label>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                value={editingSeasonTitle}
                onChange={(e) =>
                  setEditingSeasonTitle(
                    e.target.value
                  )
                }
                placeholder={`Season ${selectedSeason.season_number}`}
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
              />

              <button
                type="button"
                onClick={
                  handleSaveSelectedSeasonTitle
                }
                disabled={
                  savingEpisodeSeasonTitle
                }
                style={{
                  ...secondaryButtonStyle,
                  opacity:
                    savingEpisodeSeasonTitle
                      ? 0.6
                      : 1,
                }}
              >
                {savingEpisodeSeasonTitle
                  ? "Saving..."
                  : "Save Title"}
              </button>
            </div>

            <p
              style={{
                color: "#666",
                fontSize: "12px",
                margin: "6px 0 0",
              }}
            >
              You can rename this season at any time.
            </p>
          </div>
        )}
      </div>

      {/* EPISODE NUMBER */}

      <div>
        <label
          style={
            labelStyle
          }
        >
          Episode Number
        </label>

        <input
          type="number"
          min="1"
          value={
            form.episodeNumber
          }
          onChange={(e) =>
            update(
              "episodeNumber",
              e.target
                .value
            )
          }
          style={
            inputStyle
          }
        />

        <p
          style={{
            color:
              "#666",
            fontSize:
              "12px",
            margin:
              "6px 0 0",
          }}
        >
          Enter any episode
          number you want.
          For example: 1, 8,
          15.
        </p>
      </div>

      {/* THUMBNAIL */}

      <div>
        <label
          style={
            labelStyle
          }
        >
          Thumbnail URL
        </label>

        <input
          value={
            form.thumbnailUrl
          }
          onChange={(e) =>
            update(
              "thumbnailUrl",
              e.target
                .value
            )
          }
          placeholder="https://..."
          style={
            inputStyle
          }
        />
      </div>

      {/* VIDEO SOURCE */}

      <div>
        <label
          style={
            labelStyle
          }
        >
          Video Source
        </label>

        <select
          value={
            form.sourceType
          }
          onChange={(e) =>
            update(
              "sourceType",
              e.target
                .value
            )
          }
          style={
            inputStyle
          }
        >
          <option value="youtube">
            YouTube
          </option>

          <option value="external">
            External URL
          </option>

          <option value="upload">
            Direct Upload
          </option>
        </select>
      </div>

      {/* VIDEO URL */}

      {form.sourceType !==
        "upload" && (
        <div>
          <label
            style={
              labelStyle
            }
          >
            Video URL
          </label>

          <input
            value={
              form.videoUrl
            }
            onChange={(e) =>
              update(
                "videoUrl",
                e.target
                  .value
              )
            }
            placeholder="https://youtube.com/..."
            style={
              inputStyle
            }
          />
        </div>
      )}

      {/* UPLOAD NOTICE */}

      {form.sourceType ===
        "upload" && (
        <div
          style={{
            background:
              "#191919",
            border:
              "1px solid #2a2a2a",
            borderRadius:
              "8px",
            padding:
              "15px",
            color:
              "#999",
            fontSize:
              "14px",
          }}
        >
          Direct video upload
          will be connected to
          cloud storage later.
          The database is
          already prepared for
          it.
        </div>
      )}

      {/* PUBLISHED */}

      <div
        style={{
          gridColumn:
            "1 / -1",
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "10px",
          paddingTop:
            "5px",
        }}
      >
        <input
          id="episode-published"
          type="checkbox"
          checked={
            form.published
          }
          onChange={(e) =>
            update(
              "published",
              e.target
                .checked
            )
          }
          style={{
            width:
              "18px",
            height:
              "18px",
          }}
        />

        <label
          htmlFor="episode-published"
          style={{
            color:
              "#ccc",
            fontSize:
              "14px",
          }}
        >
          Published
        </label>
      </div>
    </div>
  );
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

const panelStyle: CSSProperties =
  {
    background: "#111",
    border:
      "1px solid #222",
    borderRadius:
      "16px",
    padding:
      "25px",
    marginBottom:
      "30px",
  };

const labelStyle: CSSProperties =
  {
    display:
      "block",
    color:
      "#bbb",
    fontSize:
      "13px",
    marginBottom:
      "8px",
  };

const inputStyle: CSSProperties =
  {
    width:
      "100%",
    boxSizing:
      "border-box",
    background:
      "#0b0b0b",
    color:
      "#fff",
    border:
      "1px solid #303030",
    borderRadius:
      "8px",
    padding:
      "12px 14px",
    fontSize:
      "14px",
    outline:
      "none",
  };

const primaryButtonStyle: CSSProperties =
  {
    background:
      "#fff",
    color:
      "#000",
    border:
      "none",
    borderRadius:
      "8px",
    padding:
      "12px 20px",
    fontSize:
      "14px",
    fontWeight:
      600,
    cursor:
      "pointer",
    whiteSpace:
      "nowrap",
  };

const secondaryButtonStyle: CSSProperties =
  {
    background:
      "transparent",
    color:
      "#aaa",
    border:
      "1px solid #333",
    borderRadius:
      "8px",
    padding:
      "12px 20px",
    fontSize:
      "14px",
    cursor:
      "pointer",
    whiteSpace:
      "nowrap",
  };

const dangerButtonStyle: CSSProperties =
  {
    background: "transparent",
    color: "#ff8d8d",
    border: "1px solid #542d2d",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

const tableHeaderStyle: CSSProperties =
  {
    padding:
      "15px 20px",
    color:
      "#777",
    fontSize:
      "12px",
    fontWeight:
      500,
    textTransform:
      "uppercase",
  };

const tableCellStyle: CSSProperties =
  {
    padding:
      "16px 20px",
    color:
      "#aaa",
    fontSize:
      "14px",
    verticalAlign:
      "middle",
  };