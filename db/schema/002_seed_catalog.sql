INSERT INTO CatalogItem (catalogItemId, tenantId, name, vendorCode, denominationUSD, isActive)
VALUES
(NEWID(), NULL, 'Amazon US $10', 'AMZN_US_10', 10.00, 1),
(NEWID(), NULL, 'Target $10', 'TGT_US_10', 10.00, 1),
(NEWID(), NULL, 'Starbucks $5', 'SBX_US_5', 5.00, 1),
(NEWID(), NULL, 'Visa Prepaid $25', 'VISA_US_25', 25.00, 1);