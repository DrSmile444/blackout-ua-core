import { Module } from '@nestjs/common';

// import { DatabaseModule } from './database/database.module';
import { OutrageParserService, OutrageStorageService } from './services';

@Module({
  // imports: [DatabaseModule],
  providers: [OutrageParserService, OutrageStorageService],
  exports: [OutrageParserService, OutrageStorageService],
})
export class SharedModule {}
