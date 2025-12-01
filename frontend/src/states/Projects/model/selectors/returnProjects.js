export const returnProjects = (state) => state.projects.projects;
export const returnProjectNames = (state) => state.projects.projectNames;
export const returnCurrentProject = (state) => state.projects.currentProject;
export const returnCurrentProjectId = (state) => state.projects.currentProjectId;
export const returnProjectsLoading = (state) => state.projects.loading;
export const returnProjectsPageLoading = (state) => state.projects.pageLoading;
export const returnProjectsError = (state) => state.projects.error;
export const selectLibraryFilesMap = (s) => s.projects.libraryFiles;
export const selectLibraryFilesList = (s) => Array.isArray(s.projects.libraryFiles) ? s.projects.libraryFiles : [];