using DAL.Helpers;
using Dapper;
using Microsoft.Extensions.Configuration;
using Model.Constants;
using Model.CustomeAttributes;
using Model.DomainModel;
using Model.ViewModel;
using MySql.Data.MySqlClient;
using System.Data;
using System.Reflection;
using System.Text;
using Utils.Interface;

namespace DAL
{
    public class GeneralDAL
    {
        private readonly IConfiguration _configuration;

        private readonly string connectionId = "Default";
        public GeneralDAL(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public string FileMaster_SaveUpdate(FileMasterModel model)
        {
            dynamic @params = new
            {
                pId = model.Id,
                pType = model.Type,
                pOriginalFileName = model.OriginalFileName,
                pThumbnailSavedFileName = model.ThumbnailSavedFileName,
                pSavedFileName = model.SavedFileName,
                pFileType = model.FileType,
                pTypeName = model.TypeName,
                pTypeId = model.TypeId,
                pIsActive = model.IsActive,
                pSavedBy = model.SavedBy,
                pSavedByUserName = model.SavedByUserName,
                pSavedDate = model.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "FileMaster_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<FileMasterModel> FileMaster_Get(bool IsActive, string Id = "", string Type = "", string TypeId = "", string SavedFileName = "")
        {
            dynamic @params = new
            {
                pId = Id?.Trim() ?? "",
                pType = Type?.Trim() ?? "",
                pTypeId = TypeId?.Trim() ?? "",
                pIsActive = IsActive,
                pSavedFileName = SavedFileName?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<FileMasterModel>(connection, "FileMaster_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<FileMasterModel>();
        }

        #region RecordHistory
        public bool SaveRecordDifference(ObjectDifference model)
        {
            List<RecordHistoryModel> list = new List<RecordHistoryModel>();
            if (model.NewObjectType == model.OldObjectType)
            {
                TableInfoAttribute? tableInfoAttribute = Attribute.GetCustomAttribute(model.NewObjectType, typeof(TableInfoAttribute)) as TableInfoAttribute;
                PropertyInfo? uniqueIdProperty = model.Properties.Where(p => p.Name == (tableInfoAttribute?.KeyFieldName ?? ""))?.FirstOrDefault();
                foreach (PropertyInfo property in model.Properties.Where(p => p.Name != (uniqueIdProperty?.Name ?? "")))
                {
                    string oldValue = property.GetValue(model.OldObject)?.ToString()?.Trim() ?? "";
                    string newValue = property.GetValue(model.NewObject)?.ToString()?.Trim() ?? "";

                    if (property.PropertyType.Name.ToLower() == "int32")
                    {
                        oldValue = Convert.ToInt32(oldValue).ToString();
                        newValue = Convert.ToInt32(newValue).ToString();
                    }
                    else if (property.PropertyType.Name.ToLower() == "decimal")
                    {
                        oldValue = Convert.ToDecimal(oldValue).ToString();
                        newValue = Convert.ToDecimal(newValue).ToString() + ".00";
                    }

                    RecordHistoryModel item = new RecordHistoryModel();

                    if (tableInfoAttribute is not null)
                    {
                        item.TableName = tableInfoAttribute.TableName;
                    }
                    if (uniqueIdProperty is not null)
                    {
                        item.TableUniqueId = uniqueIdProperty.GetValue(model.OldObject)?.ToString() ?? "";
                        if (string.IsNullOrWhiteSpace(item.TableUniqueId.Trim()))
                        {
                            item.TableUniqueId = uniqueIdProperty.GetValue(model.NewObject)?.ToString() ?? "";
                        }
                    }
                    item.ColumnName = property.Name;
                    item.SavedBy = model.SavedBy;
                    item.SavedByUserName = model.SavedByUserName;
                    item.SavedDate = model.SavedDate;

                    if (!string.IsNullOrWhiteSpace(item.TableUniqueId))
                    {
                        if (model.IsDeleted)
                        {
                            item.OldValue = oldValue;
                            item.Action = "D";
                            list.Add(item);
                        }
                        else if (string.IsNullOrWhiteSpace(oldValue) && !string.IsNullOrWhiteSpace(newValue))
                        {
                            item.NewValue = newValue;
                            item.Action = "A";
                            list.Add(item);
                        }
                        else if (!string.IsNullOrWhiteSpace(oldValue) && !string.IsNullOrWhiteSpace(newValue) && oldValue != newValue)
                        {
                            item.OldValue = oldValue;
                            item.NewValue = newValue;
                            item.Action = "U";
                            list.Add(item);
                        }
                    }
                }

                if (list.FirstOrDefault()?.Action == "A")
                {
                    RecordHistoryModel? mod = list.FirstOrDefault();

                    if (mod != null)
                    {
                        mod.OldValue = "";
                        mod.NewValue = "";
                        list.Clear();
                        list.Add(mod);
                    }
                }

                return RecordHistory_SaveUpdate(list);
            }
            return false;
        }
        public bool RecordHistory_SaveUpdate(List<RecordHistoryModel> list)
        {
            if (list.Count > 0)
            {
                foreach (RecordHistoryModel model in list)
                {
                    dynamic @params = new
                    {
                        pId = Guid.NewGuid().ToString(),
                        pAction = model.Action,
                        pTableName = model.TableName ?? "",
                        pTableUniqueId = model.TableUniqueId ?? "",
                        pColumnName = model.ColumnName ?? "",
                        pOldValue = model.OldValue ?? "",
                        pNewValue = model.NewValue ?? "",
                        pSavedBy = model.SavedBy,
                        pSavedByUserName = model.SavedByUserName,
                        pSavedDate = model.SavedDate,
                    };

                    using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
                    string id = SqlMapper.ExecuteScalar<string>(connection, "Record_History_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
                }

                return true;
            }

            return false;
        }
        public List<RecordHistoryModel> GetRecordHistory(TableFilterModel model, out int TotalCount)
        {
            TotalCount = 0;
            string Query = @"SELECT Id, Action, TableName, TableUniqueId, ColumnName, OldValue, NewValue, CreatedBy, CreatedByUserName, CreatedDate FROM record_history ";

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            if (model != null)
            {
                string Condition = " WHERE ";

                if (!string.IsNullOrWhiteSpace(model?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> whereProperties = new List<string>() { "Id", "Action", "TableName", "TableUniqueId", "ColumnName", "OldValue", "NewValue", "CreatedByUserName" };
                    foreach (var property in whereProperties)
                    {
                        searchCondition += property + " LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                    }
                    searchCondition += ") AND";

                    Condition += searchCondition;
                }

                if (model?.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in model.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            Condition += " " + item.FieldName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ";
                        }
                    }
                }

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                TotalCount = (SqlMapper.Query<RecordHistoryModel>(connection, (Query + Condition).ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<RecordHistoryModel>()).Count();

                if (model?.Sorting != null && !string.IsNullOrWhiteSpace(model?.Sorting.FieldName) && !string.IsNullOrWhiteSpace(model?.Sorting.Sort))
                {
                    if (model?.Skip == 0 && model?.Take == 0)
                    {
                        Condition += " ORDER BY " + model?.Sorting.FieldName + " " + model?.Sorting.Sort + " ";
                    }
                    else
                    {
                        Condition += " ORDER BY " + model?.Sorting.FieldName + " " + model?.Sorting.Sort + " LIMIT  " + model?.Take + "  OFFSET " + model?.Skip;
                    }
                }
                else if (model?.Skip == 0 && model?.Take == 0)
                {
                    Condition += " ORDER BY CreatedDate ";
                }
                else
                {
                    Condition += " ORDER BY CreatedDate LIMIT  " + model?.Take + "  OFFSET " + model?.Skip;
                }

                Query += Condition;
            }


            return SqlMapper.Query<RecordHistoryModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<RecordHistoryModel>();
        }
        #endregion RecordHistory

        #region Mail SMS Log

        public string MailSMSLog_Save(MailSMSLog model)
        {
            dynamic @params = new
            {
                pRecordType = model.RecordType ?? "",
                pSentAddress = model.SentAddress ?? "",
                pSubject = model.Subject ?? "",
                pBody = model.Body ?? "",
                pType = model.Type ?? "",
                pTypeId = model.TypeId ?? "",
                pReceivedBy = model.ReceivedBy ?? "",
                pSavedBy = model.CreatedBy,
                pSavedByUserName = model.CreatedByUserName,
                pSavedDate = model.CreatedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            string id = SqlMapper.ExecuteScalar<string>(connection, "Mail_SMS_Log_Save", @params, commandType: CommandType.StoredProcedure);

            return id;
        }

        public List<MailSMSLog> MailSMSLog_Get(MailSMSLog model)
        {
            dynamic @params = new
            {
                pId = model.Id ?? "",
                pRecordType = model.RecordType ?? "",
                pSentAddress = "'%" + (model.SentAddress ?? "") + "%'",
                pType = model.Type ?? "",
                pTypeId = model.TypeId ?? "",
                pReceivedBy = model.ReceivedBy ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<MailSMSLog>(connection, "Mail_SMS_Log_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<MailSMSLog>();
        }

        #endregion Mail SMS Log

        #region Comment
        public string Comment_SaveUpdate(CommentMasterModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Id))
            {
                model.Id = Guid.NewGuid().ToString();
            }
            dynamic @params = new
            {
                pId = model.Id,
                pType = model.Type,
                pParentId = model.ParentId,
                pTypeId = model.TypeId,
                pCommentsFrom = model.CommentsFrom,
                pCommentsText = model.CommentsText,
                pSubjectText = model.SubjectText,
                pSavedBy = model.CreatedBy,
                pSavedByUserName = model.CreatedByUserName,
                pSavedDate = model.CreatedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Comment_Master_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }
        public List<CommentMasterModel> Comment_Get(string Type = "", string TypeId = "", string CommentsFrom = "", string ParentId = "")
        {
            dynamic @params = new
            {
                pType = Type?.Trim() ?? "",
                pParentId = ParentId?.Trim() ?? "",
                pTypeId = TypeId?.Trim() ?? "",
                pCommentsFrom = CommentsFrom?.Trim() ?? "",
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<CommentMasterModel>(connection, "Comment_Master_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<CommentMasterModel>();
        }
        public List<CommentMasterModel> Comment_Get(CommentFilterModel model, out int TotalCount)
        {
            TotalCount = 0;
            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));

            string Query = @"SELECT Id, Type, TypeId, ParentId, CommentsFrom, CommentsText, SubjectText, CommentDate, CreatedBy, 
                                CreatedByUserName, CreatedDate, Suffix, Prefix, RunningNumber, CommentNumber
                                FROM Comment_Master ";

            if (model != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE ";

                if (model.Where != null)
                {
                    PropertyInfo[] whereProperties = typeof(CommentWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(model.Where)?.ToString() ?? "";
                        if (value == "True")
                        {
                            value = "1";
                        }
                        else if (value == "False")
                        {
                            value = "0";
                        }
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            Condition += " " + property.Name + "='" + value.Replace('\'', '%').Trim() + "' AND ";
                        }
                    }
                }
                if (model?.Ids?.Count > 0)
                {
                    string recordIds_str = "";
                    model.Ids.ForEach(x =>
                    {
                        recordIds_str += "'" + x + "',";
                    });
                    recordIds_str = recordIds_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(recordIds_str))
                    {
                        Condition += " TypeId IN (" + recordIds_str + ") AND ";
                    }
                }
                if (model?.Types?.Count > 0)
                {
                    string recordTypes_str = "";
                    model.Types.ForEach(x =>
                    {
                        recordTypes_str += "'" + x + "',";
                    });
                    recordTypes_str = recordTypes_str.Trim().Trim(',');
                    if (!string.IsNullOrWhiteSpace(recordTypes_str))
                    {
                        Condition += " Type IN (" + recordTypes_str + ") AND ";
                    }
                }
                if (!string.IsNullOrWhiteSpace(model?.SearchString))
                {
                    string searchCondition = " (";
                    PropertyInfo[] whereProperties = typeof(CommentWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        if (property.PropertyType.Name.ToLower() != "boolean")
                        {
                            searchCondition += property.Name + " LIKE " + "'%" + model.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition += ") AND";

                    Condition += searchCondition;
                }

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                TotalCount = (SqlMapper.Query<CommentMasterModel>(connection, (Query + Condition).ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<CommentMasterModel>()).Count();

                if (model?.Sorting != null && !string.IsNullOrWhiteSpace(model?.Sorting.FieldName) && !string.IsNullOrWhiteSpace(model?.Sorting.Sort))
                {
                    if (model?.Skip == 0 && model?.Take == 0)
                    {
                        Condition += " ORDER BY " + model?.Sorting.FieldName + " " + model?.Sorting.Sort + " ";
                    }
                    else
                    {
                        Condition += " ORDER BY " + model?.Sorting.FieldName + " " + model?.Sorting.Sort + " LIMIT  " + model?.Take + "  OFFSET " + model?.Skip;
                    }
                }
                else if (model?.Skip == 0 && model?.Take == 0)
                {
                    Condition += " ORDER BY CreatedDate ";
                }
                else
                {
                    Condition += " ORDER BY CreatedDate LIMIT " + model?.Take + " OFFSET " + model?.Skip;
                }

                Query += Condition;

                #endregion Build Query Conditions
            }

            return SqlMapper.Query<CommentMasterModel>(connection, Query.ToLower(), commandType: CommandType.Text)?.ToList() ?? new List<CommentMasterModel>();
        }
        #endregion Comment

        #region Feedback
        public string FeedbackSaveUpdate(FeedbackModel model, AuditColumnsModel audit)
        {
            if (string.IsNullOrWhiteSpace(model.Id))
            {
                model.Id = Guid.NewGuid().ToString();
            }
            dynamic @params = new
            {
                pId = model.Id,
                pName = model.Name,
                pMobileNumber = model.MobileNumber,
                pFeedback = model.Feedback,
                pIsActive = model.IsActive,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Feedback_save", @params, commandType: CommandType.StoredProcedure);
        }
        public List<FeedbackViewModel> FeedbackList(FeedbackFilterModel filter, out int TotalCount)
        {
            TotalCount = 0;

            string Query = @"select Id, Name, MobileNumber, Feedback, 
                                CreatedBy, CreatedByUserName, CreatedDate, ModifiedBy, ModifiedByUserName,
                                ModifiedDate, DeletedBy, DeletedByUserName, DeletedDate
                                from feedback_master ";

            string CountQuery = @"select count(1) from feedback_master ";

            if (filter != null)
            {
                #region Build Query Conditions

                string Condition = " WHERE ";

                if (filter.Where != null)
                {
                    PropertyInfo[] whereProperties = typeof(FeedbackWhereClauseProperties).GetProperties();
                    foreach (var property in whereProperties)
                    {
                        var value = property.GetValue(filter.Where)?.ToString() ?? "";
                        if (!string.IsNullOrWhiteSpace(value))
                        {
                            if (property.Name == "FromDate")
                            {
                                var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                                var istTime = TimeZoneInfo.ConvertTimeFromUtc(filter.Where.FromDate.DateTime, istZone);

                                if (filter.Where.FromDate.ToString("yyyy-MM-dd") != "0001-01-01")
                                {
                                    Condition += " DATE(ModifiedDate) >= '" + filter.Where.FromDate.ToString("yyyy-MM-dd") + "' AND ";
                                }
                            }
                            else if (property.Name == "ToDate")
                            {
                                var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                                var istTime = TimeZoneInfo.ConvertTimeFromUtc(filter.Where.ToDate.DateTime, istZone);

                                if (filter.Where.ToDate.ToString("yyyy-MM-dd") != "0001-01-01")
                                {
                                    Condition += " DATE(ModifiedDate) <= '" + filter.Where.ToDate.ToString("yyyy-MM-dd") + "' AND ";
                                }
                            }
                        }
                    }
                }

                if (filter.ColumnSearch?.Count > 0)
                {
                    foreach (ColumnSearchModel item in filter.ColumnSearch)
                    {
                        if (!string.IsNullOrWhiteSpace(item.SearchString?.Trim()) && !string.IsNullOrWhiteSpace(item.FieldName?.Trim()))
                        {
                            string columnName = "";

                            #region Field Name Select
                            if (string.Equals(item.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "Name";
                            }
                            else if (string.Equals(item.FieldName, "MobileNumber", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "MobileNumber";
                            }
                            else if (string.Equals(item.FieldName, "Feedback", StringComparison.CurrentCultureIgnoreCase))
                            {
                                columnName = "Feedback";
                            }
                           
                            #endregion Field Name Select

                            if (!string.IsNullOrWhiteSpace(columnName))
                            {
                                Condition += " " + columnName + " LIKE " + "'%" + item.SearchString.Replace('\'', '%').Trim() + "%' AND ";
                            }
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(filter?.SearchString))
                {
                    string searchCondition = " (";
                    List<string> columnsToSearch = new List<string>() {
                        "Name",
                        "MobileNumber",
                        "Feedback",
                        "CreatedByUserName", "ModifiedByUserName", "DeletedByUserName",
                        "DATE_FORMAT(CreatedDate, '%d-%m-%Y')", "DATE_FORMAT(ModifiedDate, '%d-%m-%Y')", "DATE_FORMAT(DeletedDate, '%d-%m-%Y')"
                    };
                    foreach (var column in columnsToSearch)
                    {
                        if (!string.IsNullOrEmpty(column))
                        {
                            searchCondition += column + " LIKE " + "'%" + filter.SearchString.Trim() + "%' OR ";
                        }
                    }
                    searchCondition = searchCondition.Remove(searchCondition.Length - 3);
                    searchCondition += ") AND ";

                    Condition += searchCondition;
                }

                if (Condition.Substring(Condition.Length - 5) == " AND ")
                {
                    Condition = Condition.Remove(Condition.Length - 5);
                }
                if (Condition == " WHERE ")
                {
                    Condition = "";
                }

                #endregion Build Query Conditions

                CountQuery = CountQuery + Condition;

                using (var conn = new MySqlConnection(_configuration.GetConnectionString(connectionId)))
                {
                    TotalCount = SqlMapper.ExecuteScalar<int>(conn, CountQuery, commandType: CommandType.Text);

                    #region Pagination Condition

                    if (filter?.Sorting != null && !string.IsNullOrWhiteSpace(filter?.Sorting?.FieldName) && !string.IsNullOrWhiteSpace(filter?.Sorting?.Sort))
                    {
                        string FieldName = "";

                        #region Select Field
                        if (string.Equals(filter?.Sorting.FieldName, "Name", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "Name";
                        }
                        else if (string.Equals(filter?.Sorting.FieldName, "MobileNumber", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "MobileNumber";
                        }
                        else if(string.Equals(filter?.Sorting.FieldName, "Feedback", StringComparison.CurrentCultureIgnoreCase))
                        {
                            FieldName = "Feedback";
                        }
                        else
                        {
                            FieldName = "ModifiedDate";
                        }
                        #endregion Select Field

                        if (filter?.Skip == 0 && filter?.Take == 0)
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " ";
                        }
                        else
                        {
                            Condition += " ORDER BY " + FieldName + " " + filter?.Sorting.Sort + " LIMIT  " + filter?.Take + "  OFFSET " + filter?.Skip;
                        }
                    }
                    else if (filter?.Skip == 0 && filter?.Take == 0)
                    {
                        Condition += " ORDER BY ModifiedDate ";
                    }
                    else
                    {
                        Condition += " ORDER BY ModifiedDate LIMIT " + filter?.Take + " OFFSET " + filter?.Skip;
                    }

                    #endregion Pagination Condition

                    Query += Condition;

                    return SqlMapper.Query<FeedbackViewModel>(conn, Query, commandType: CommandType.Text)?.ToList() ?? new List<FeedbackViewModel>();
                }
            }

            return null;
        }
        #endregion Feedback

        public List<ConfigurationGeneralModel> General_Configuration_GetByKey(string ConfigKey = "")
        {
            dynamic @params = new
            {
                pConfigKey = ConfigKey
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.Query<ConfigurationGeneralModel>(connection, "Configuration_General_Get", @params, commandType: CommandType.StoredProcedure) ?? new List<ConfigurationGeneralModel>();
        }
        public int ApplicationExpiryDays()
        {
            int expireInDays = 7;
            List<ConfigurationGeneralModel> expireInDaysConfig = General_Configuration_GetByKey(GeneralConfigKeyConstants.ApplicationExpiryDays);
            if (expireInDaysConfig != null && expireInDaysConfig.Count > 0)
            {
                if (!string.IsNullOrEmpty(expireInDaysConfig[0].ConfigValue))
                {
                    expireInDays = Convert.ToInt32(expireInDaysConfig[0].ConfigValue);
                }
            }
            return expireInDays;
        }
        public string General_Configuration_SaveUpdate(ConfigurationGeneralModel model, AuditColumnsModel audit)
        {
            dynamic @params = new
            {
                pConfigName = model.ConfigName,
                pConfigDesc = model.ConfigDesc,
                pConfigKey = model.ConfigKey,
                pConfigValue = model.ConfigValue,
                pSavedBy = audit.SavedBy,
                pSavedByUserName = audit.SavedByUserName,
                pSavedDate = audit.SavedDate,
            };

            using IDbConnection connection = new MySqlConnection(_configuration.GetConnectionString(connectionId));
            return SqlMapper.ExecuteScalar<string>(connection, "Configuration_General_SaveUpdate", @params, commandType: CommandType.StoredProcedure);
        }

    }
}
